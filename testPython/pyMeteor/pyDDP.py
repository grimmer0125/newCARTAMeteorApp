from __future__ import print_function

import json, pprint, socket, time, uuid
from ws4py.client.threadedclient import WebSocketClient

from srp import MeteorUser
from dbPrint import Printer


class ReactiveDict(dict):
    def __init__(self, pyDict, myCollection):
        self.myCollection = myCollection
        self.nonReactiveUpdate(pyDict)
        self.reactive = True

    def __setitem__(self, item, setTo):
        # If no actual change happens, do nothing!
        if (item in self) and (self[item] == setTo):
                    return

        # Actual local change happened. First update locally
        self.nonReactiveSet(item, setTo)
        self.pushUpdate()

    def pushUpdate(self):
        # If reactive, syncronize with using ddpClient
        if self.reactive:
            # self.myCollection.client.method("/" + self.myCollection.collectionName + "/update", [{"_id": self["_id"]}, self])
            self.myCollection.client.method("clobberProperty", [self])

    def update(self, pyDict):
        # Overriding built in update this way
        # makes the reactive stuff work properly
        self.nonReactiveUpdate(pyDict)
        self.pushUpdate()

    # Non reactive versions of set and update
    def nonReactiveUpdate(self, pyDict):
        for k in pyDict.keys():
            self.nonReactiveSet(k, pyDict[k])

    def nonReactiveSet(self, item, setTo):
        super(ReactiveDict, self).__setitem__(item, setTo)

    def setReactive(self, enabled):
        self.reactive = enabled


class DDPCollection(list):
    def __init__(self, collectionName, ddpClient):
        self.collectionName = collectionName
        self.client = ddpClient
        self._ids = []
        self.defaultObserveCallbacks = {
            'added': [],
            'changed': [],
            'removed': [],
            'movedBefore': [],
            'addedBefore': []
        }
        self.observeCallbacks = self.defaultObserveCallbacks.copy()

    def observeChanges(self, eventDict):
        '''
        Should mirror Meteor's API, for the callbacks too,
        except for `changed`, for which the args are (newObj, oldObj)
        since that was easier to implement and seems more useful.
        '''
        for eventName, cb in eventDict.items():
            self.observeCallbacks[eventName].append(cb)

    def clearAllObserveCallbacks(self):
        self.observeCallbacks = self.defaultObserveCallbacks.copy()

    #########################
    # User facing functions #
    #########################
    def insert(self, pyDict, blocking=False):
        # Generate an id if id dosent already have one
        if "_id" not in pyDict:
            pyDict["_id"] = uuid.uuid4().hex

        # Call the apropriate update method
        methodName = "/" + self.collectionName + "/insert"
        rID = self.client.method(methodName, [pyDict], track=blocking)

        # Block on receiving the write confirm or error back
        if blocking:
            self.client.getResult(rID)

    def update(self, selector, updator, blocking=False):
        raise NotImplemented("TODO: Figure out why broken!!?!?!")
        # Call the apropriate update method
        methodName = "/" + self.collectionName + "/update"
        rID = self.client.method(methodName, [selector, updator], track=blocking)

        # Block on receiving the write confirm or error back
        if blocking:
            self.client.getResult(rID)

    def find(self, selector):
        results = []
        for doc in self:
            for k, v in selector.items():
                if (k in doc) and (doc[k] == v):
                    results.append(doc)
        return results

    def findOne(self, selector):
        for doc in self:
            for k, v in selector.items():
                if (k in doc) and (doc[k] == v):
                    return doc
        return None

    def remove(self, selector):
        docsToRemove = self.find(selector)
        for doc in docsToRemove:
            self._ids.remove(doc["_id"])
            self.remove(doc)

            # Remove them in the remote collection as well
            methodName = "/" + self.collectionName + "/remove"
            self.client.method(methodName, [doc])

    def __getitem__(self, offset):
        return super(DDPCollection, self).__getitem__(offset)

    ######################################
    # Processed calls from meteor server #
    ######################################
    def _added(self, _id, obj={}):
        # Put the id in the object, and make it reactive
        obj["_id"] = _id
        obj = ReactiveDict(obj, self)

        # Then add the object and its id to the respective lists
        self._ids.append(_id)
        self.append(obj)

        [cb(_id, obj) for cb in self.observeCallbacks['added']]

    def _changed(self, _id, obj, cleared):
        # Update new/changed fields
        itemToBeUpdated = self._getByID(_id)
        oldItem = dict(itemToBeUpdated)

        for k in obj.keys():
            itemToBeUpdated.nonReactiveSet(k, obj[k])
        # Remove cleared ones
        for k in cleared:
            itemToBeUpdated.pop(k)

        [cb(itemToBeUpdated, oldItem) for cb in self.observeCallbacks['changed']]

    def _addedBefore(self, _id, obj, idBefore):
        # Put the id in the object, and make it reactive
        obj["_id"] = _id
        obj = ReactiveDict(obj, self)

        # Find the place that it goes
        beforeIndex = self._ids.index(_id)

        # Put it there in both lists
        self._ids.insert(beforeIndex, _id)
        self.insert(beforeIndex, obj)

        [cb(_id, obj, idBefore) for cb in self.observeCallbacks['addedBefore']]

    def _movedBefore(self, _id, idBefore):
        # Remove the object  . . .
        obj = self.removed(_id)
        # then stick it the new place it goes.
        self.addedBefore(_id, obj, idBefore)

        [cb(_id, idBefore) for cb in self.observeCallbacks['movedBefore']]

    def _removed(self, _id):
        # Remove the object
        oldIndx = self._ids.index(_id)
        self._ids.pop(oldIndx)
        obj = self.pop(oldIndx)

        [cb(_id) for cb in self.observeCallbacks['removed']]

        return obj

    def _getByID(self, itemID):
        return super(DDPCollection, self).__getitem__(self._ids.index(itemID))

    def __str__(self):
        return "DDP Collection '{0}' with {1} entries: {2} ".format(self.collectionName, pprint.pformat(self), len(self))


class Subscription(object):
    def __init__(self, ddpc, subID):
        self.ddpc = ddpc
        self.subID = subID
        self.stopped = False

    def ready(self):
        # If the subscription has been stopped, def not ready
        if self.stopped:
            return False

        # If it hasn't heard back from the server, not ready
        if not self.ddpc.isResultReady(self.subID):
            return False

        # If it has heard back, echo that result
        return self.ddpc.getResult(self.subID)

    def blockOnReady(self):
        return self.ddpc.getResult(self.subID)

    def stop(self):
        self.ddpc.unsubscribe(self.subID)
        self.stopped = True


class CollectionCollection(object):
    # javascripty access to collections
    def __getitem__(self, item):
        return getattr(self, item)


class DDPError(RuntimeError):
    pass


class DDPDisconnected(DDPError):
    pass


class DDPClient(WebSocketClient):
    """Simple wrapper around Websockets for DDP connections"""
    def __init__(self, url, debugPrint=False, printDDP=False, raiseDDPErrors=False, printDDPErrors=True, attemptReconnect=True):
        # Call the ws init functions
        self.urlArg = url
        WebSocketClient.__init__(self, url)

        self._dbPrint = Printer(debugPrint=debugPrint)
        self._printDDPError = Printer(debugPrint=printDDPErrors)
        self._printDDP = Printer(debugPrint=printDDP)

        # Record the outstanding method calls to link wrt requests
        self.requestsToTrack = []
        self.requestReplies = {}
        self.subNameToID = {}

        # Place to collect collections
        self.collections = CollectionCollection()

        # Store the flags for what to do in various scenarios
        self.debugPrint = debugPrint
        self.raiseDDPErrors = raiseDDPErrors
        self.printDDP = printDDP
        self.printDDPErrors = printDDPErrors
        self.attemptReconnect = attemptReconnect

        self.closeCallbacks = []
        self.reconnectCallbacks = []

        # Set the connected flag to False
        self.DDP_Connected = False

        # Flag to see if we requested a close connection
        self.closeRequested = False

    ##################################
    # DDP Setup and teardown methods #
    ##################################
    def _attemptConnection(self, timeout=5):
        # ws4py method that does the negotiation about things
        self.connect()

        # Once the WS connection is made, the "opened" function is called,
        # Which on successful DDP negotiation will set the self.DDP_Connected flag to True

        startTime = time.time()
        while time.time() - startTime < timeout:
            if self.DDP_Connected:
                return
            time.sleep(0.05)

        errorString = "DDP Connection failed, after timeout: " + str(timeout)
        raise DDPError(errorString)

    def closeDDP(self):
        # Set a flag so the closed trigger does not complain, the pull the ws4py trigger
        self.closeRequested = True
        self.close(reason="Its not you, its me.")

    def connectDDP(self, timeout=3, isReconnect=False):
        if isReconnect:
            self._dbPrint("Attempting reconnect with timeout: %i seconds. . ." % timeout)
            self.close_connection()  # try to free up some OS resources
            time.sleep(timeout)
            WebSocketClient.__init__(self, self.urlArg)
        else:
            self._dbPrint("Starting DDP connection. . .")

        try:
            self._attemptConnection()
        # except (DDPError, ConnectionRefusedError) as e:
        except Exception as e:
            self._dbPrint("ddpClient._attemptConnection() raised an exception:")
            print(e)
            timeoutExponent = 1.2

            if not self.attemptReconnect:
                raise e
            self.connectDDP(isReconnect=True, timeout=timeout * timeoutExponent)
        else:
            if isReconnect:
                self._dbPrint("Reconnect successful!")
                [cb() for cb in self.reconnectCallbacks]
                self.run_forever()
            else:
                self._dbPrint("DDP connection established!")

    def onClose(self, cb):
        self.closeCallbacks.append(cb)

    def onReconnect(self, cb):
        self.reconnectCallbacks.append(cb)

    ##############################
    # ws4py overridden functions #
    ##############################
    def opened(self):
        # This function is triggered when ws4py finishes resolving/handshaking/upgrade etc.
        # Fire off our ddp version negotiation
        # MRG TODO: update wrt ddp spec at: https://github.com/meteor/meteor/blob/master/packages/livedata/DDP.md
        connectionMsg = {"msg": "connect",
                         "version": "pre1",
                         "support": ["pre1"]}
        self._sendDict(connectionMsg, sendIfDisconnected=True)
        self._dbPrint("Sent DDP connection message to server.")

    def closed(self, code, reason=None):
        """Called when the connection is closed"""

        self.DDP_Connected = False
        self._dbPrint('DDP Connection Closed with code: {0}. Reason given: "{1}"'.format(code, reason))

        [cb(code, reason) for cb in self.closeCallbacks]

        # If this was a scheduled loss of connection, go with it
        if self.closeRequested:
            return

        # Try to reconnect if that is the configured behavior, otherwise error out
        if self.attemptReconnect:
            self.connectDDP(isReconnect=True)
        else:
            raise DDPError("Unexpected DDP Disconnect")

    def received_message(self, message):
        messageString = message.data.decode('ascii')
        self._printDDP('RECV <|== {}'.format(messageString))

        # MRG TODO: catch non-json errors
        # MRG TODO: add ejson support here
        msgDict = json.loads(messageString)

        if self.DDP_Connected:
            self._receiveDDP(msgDict)
        else:
            self._receiveConnect(msgDict)

    # Function to establish a DDP connection
    def _receiveConnect(self, data):
        # "The server may send an initial message which is a JSON object
        #  lacking a msg key. If so, the client should ignore it."
        if "msg" not in data:
            self._dbPrint("Ignoring initial message without 'msg' field.")
            return

        if data["msg"] == "connected":
            self._dbPrint("Received connected message from server.")
            self.DDP_Connected = True
            self.session = data["session"]
            return
        else:
            raise DDPError("Received a (non)connect message:" + str(data))
        # MRG TODO: error states of this action

    # Function to process a DDP update received over ws
    def _receiveDDP(self, msgDict):
        """Parse an incoming message and print it. Also update
        self.pending appropriately"""

        # From the spec at:
        # https://github.com/meteor/meteor/blob/c911cd9ef49ed96f04476e6f2062cec389491e38/packages/livedata/DDP.md
        #   'The server may send an initial message which is a JSON object
        #    lacking a msg key. If so, the client should ignore it.'
        if ("msg" not in msgDict) and ("server_id" in msgDict):
            self._dbPrint("Received badly formed message from server.")
            return

        assert "msg" in msgDict, "Malformed DDP response" + str(msgDict)
        msgType = msgDict['msg']

        handlerMethodName = "_handle_" + msgType
        # Make sure it is a method type we have a handler for
        if not hasattr(self, handlerMethodName):
            errMsg = "No handler for DDP message " + msgType
            raise DDPError(errMsg)

        # Get the handler and pass the object to it
        handler = getattr(self, handlerMethodName)
        handler(msgDict)

    #########################
    # Convenience functions #
    #########################
    def _ddpErrorHandler(self, errorString):
        # Print errors if requested
        self._printDDPError(errorString)

        # Raise errors if requested
        if self.raiseDDPErrors:
            raise RuntimeError(errorString)

    def _sendDict(self, msgDict, sendIfDisconnected=False):
        """Send a python dict formatted to json to the ws endpoint"""
        if not sendIfDisconnected and not self.DDP_Connected:
            self._dbPrint("Discarded DDP message since we are disconnected.")
            return

        message = json.dumps(msgDict)
        self._printDDP("SENT ==|> " + repr(message))
        try:
            self.send(message)
        except (socket.error, RuntimeError) as xception:
            if not self.attemptReconnect:
                raise DDPDisconnected("DDP Connection Lost")
            self._dbPrint('Could not send message -- Possible connection loss.')
            self._dbPrint(xception)

    def _getCollection(self, collectionName):
        # Make a collection if necessary
        if not hasattr(self.collections, collectionName):
            setattr(self.collections, collectionName, DDPCollection(collectionName, self))
        # return the relevant collection
        return getattr(self.collections, collectionName)

    def removeCollection(self, collectionName):
        if not hasattr(self.collections, collectionName):
            self._dbPrint("Cannot remove collection named \"" + collectionName + "\".  Does not exist.")

        self._getCollection(collectionName).clearAllObserveCallbacks()
        delattr(self.collections, collectionName)

    ###########################
    # DDP Message Type Handlers
    ###########################
    def _handle_error(self, msgDict):
        # Unpack the error data from the message, may have either of both of the follow feilds:
        reasonString = msgDict.get("reason", "")
        detailString = msgDict.get("offendingMessage", "")
        errorString = 'DDP Error\n\t Reason:"{0}", Offending Message:"{1}"'.format(str(reasonString), str(detailString))

        # Pass if off to the error handler, which may print or raise an exception
        self._ddpErrorHandler(errorString)

    def _handle_nosub(self, msgDict):
        self._nosub_result_error_check(msgDict, "nosub")
        self.requestReplies[msgDict["id"]] = False

    def _handle_result(self, msgDict):
        self._nosub_result_error_check(msgDict, "result")
        messageID = msgDict["id"]

        # Check to see if this is a result we are tracking
        if messageID in self.requestsToTrack:
            # If so, file the result
            self.requestReplies[messageID] = msgDict.get("result", None)

            # We only will get one result per request, so tidy the list while we are here
            self.requestsToTrack.remove(messageID)

    def _nosub_result_error_check(self, msgDict, source):
        # This function does nothing unless there is an error in the return json
        if not "error" in msgDict:
            return

        # Pull out the relevant fields
        err = msgDict["error"]
        errNumber = err.get("error", "")
        errReason = err.get("reason", "")
        errDetails = err.get("details", "")

        # Format and pass to the error handler
        errorMessage = "Error from {0}:{2} {3} ({1})".format(source, errNumber, errReason, errDetails)
        self._ddpErrorHandler(errorMessage)

    def _handle_ready(self, msgDict):
        # Ready returns an array of subscription requests that are completed their initial send
        for subscriptionID in msgDict["subs"]:
            # If we wernt tracking this subscription, we will never check if its ready
            if subscriptionID not in self.requestsToTrack:
                continue
            # Update the done ness of the subscription and remove from pending.
            self.requestReplies[subscriptionID] = True
            self.requestsToTrack.remove(subscriptionID)

    def _handle_added(self, msgDict):
        collection = self._getCollection(msgDict["collection"])
        collection._added(msgDict["id"], msgDict["fields"])

    def _handle_changed(self, msgDict):
        collection = self._getCollection(msgDict["collection"])
        collection._changed(msgDict["id"], msgDict.get("fields", {}), msgDict.get("cleared", {}))

    def _handle_removed(self, msgDict):
        collection = self._getCollection(msgDict["collection"])
        collection._removed(msgDict["id"])

    def _handle_addedBefore(self, msgDict):
        collection = self._getCollection(msgDict["collection"])
        collection._addedBefore(msgDict["id"], msgDict["fields"], msgDict["before"])

    def _handle_movedBefore(self, msgDict):
        collection = self._getCollection(msgDict["collection"])
        collection._movedBefore(msgDict["id"], msgDict["fields"], msgDict["before"])

    def _handle_updated(self, msgDict):
        pass

    # Generate an id for DDP calls that come back with results (subscribe/method)
    def _generateOutstandingID(self, prefix='method'):
        return prefix + "_" + str(uuid.uuid4())

    #########################
    # User Facing Functions #
    #########################
    def newCollection(self, collectionName):
        return self._getCollection(collectionName)

    def method(self, methodName, params=[], track=False):
        # Make a request ID, and set it to pending
        mid = self._generateOutstandingID(prefix='method_' + methodName)

        # Add to the track list if requested:
        if track:
            self.requestsToTrack.append(mid)

        # Fire the request
        msgDict = {"msg": "method", "method": methodName, "params": params, "id": mid}
        self._sendDict(msgDict)

        # Only return tracking id if requested
        if track:
            return mid

    def methodSync(self, methodName, params=[]):
        handle = self.method(methodName, params, track=True)
        return self.getResult(handle)

    def isResultReady(self, resultID):
        return resultID in self.requestReplies

    def getResult(self, resultID):
        assert resultID is not None, "Can not track None Result"
        # Spin waiting for result to come in
        while not self.isResultReady(resultID):
            time.sleep(0.01)       # Thread spin lock.  TODO: Uglee

        # Return the result!
        return self.requestReplies[resultID]

    def loginWithPassword(self, username, password):
        """
        Modeled after Meteor's Accounts.loginWithPassword, defined in the accounts-password package.
        Returns True if the login was successful; otherwise calls the DDP error handler and returns False.
        """

        try:
            srp_user = srp.MeteorUser(password, debugPrint=self.debugPrint)

            A = srp_user.start_exchange()

            # The server will return a dictionary from this method
            # that should have a 'B' key that's a hex-encoded integer,
            # a 'salt' key containing a uuid for the user's salt,
            # and an 'identity' key with the user's _id.
            server_challenge = self.methodSync('beginPasswordExchange', [{
                'user': {'username': username},
                'A': A
            }])

            M = srp_user.respond_to_challenge(server_challenge)

            server_verification = self.methodSync('login', [{'srp': {'M': M}}])

            srp_user.verify_confirmation(server_verification)

        except srp.SRPError as e:
            self._ddpErrorHandler('Authentication failed. SRP error: ' + e.args[0])
            return False
        else:
            self._dbPrint('Successfully authenticated with SRP.')
            return True

    def logout(self, track=False):
        """
        Included mostly for symmetry with the login method.
        """
        return self.method('logout', track=track)

    def logoutSync(self):
        """
        Blocking version of the logout method.
        """
        return self.methodSync('logout')

    def subscribe(self, subscriptionName, params=[]):
        # Make a request ID, and set it to pending
        subscriptionMessageID = self._generateOutstandingID(prefix='subscription_' + subscriptionName)

        # Track if desired
        self.requestsToTrack.append(subscriptionMessageID)

        # Message to make subscription happen
        msgDict = {"msg": "sub",
                   "name": subscriptionName,
                   "id": subscriptionMessageID,
                   "params": params}
        self._sendDict(msgDict)

        return Subscription(self, subscriptionMessageID)

    def unsubscribe(self, subID):
        msgDict = {"msg": "unsub", "id": subID}
        self._sendDict(msgDict)

    def __del__(self):
        self.close(reason="Its not you, its me.")


if __name__ == "__main__":
    ddpc = DDPClient("ws://localhost:3000/websocket", debugPrint=True)
    ddpc.connectDDP()

    # Subscribe to properties
    subID = ddpc.subscribe("someDocs")
    ddpc.getResult(subID)

    # Get a reactive dict like object from the collection
    fooDoc = ddpc.collections.prop.findOne({"foo": "bar"})

    # Reactivley get and set values in it
    print(fooDoc)
    fooDoc["foo2"] = "bar2"
    print(fooDoc)

    ddpc.closeDDP()
