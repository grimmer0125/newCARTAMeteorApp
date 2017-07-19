# https://github.com/3Scan/pyMeteor
from pyDDP import DDPClient
c = DDPClient("ws://127.0.0.1:3000/websocket", debugPrint=True, printDDP=True, attemptReconnect=False)
c.connectDDP()

loggedIn = c.loginWithPassword('test', '123456')
if not loggedIn:
    print('Failed login.')
    sys.exit(1)

posts = c.newCollection('tasks')
sub = c.subscribe('tasks')
print('block')
sub.blockOnReady()
print('start')
print(posts) # should print an array containing the documents in the subscription
print('end')
# methodResult = c.methodSync('myMethodName', params=['firstParam', 1, 2, 'Fourth Param'])
