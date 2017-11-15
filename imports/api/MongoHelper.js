import SessionManager from '../api/SessionManager';


// // NOTE: follow https://github.com/acdlite/flux-standard-action
// function receiveUIChange(data) {
//   return {
//     type: FILEBROWSER_CHANGE,
//     payload: {
//       data,
//     },
//   };
// }

// const genericActionCreator = (data) => {
//   return {
//     type: actionType,
//     payload:{
//       data,
//     },
//   };
// };

let _dispatch = null;

export function storeReduxDispatch(dispatch) {
  // console.log('store redux dispatch for mongo');
  _dispatch = dispatch;
}

const actionCreator = (data, actionType) => ({
  type: actionType,
  payload: {
    data,
  },
});

// TODO prevent same collection registering twice
export function setupMongoReduxListeners(collection, actionType) {
  // TODO move actionCreator above and only define once


  // const collectionObservationHandle =
  collection.find().observe({
    added(newDoc) {
      _dispatch(actionCreator(newDoc, actionType));
    },
    changed(newDoc) {
      _dispatch(actionCreator(newDoc, actionType));
    },
    // removed(oldDocument) {
    // const documents = collection.find().fetch();
    // if (documents.length > 0) {
    //   const doc = documents[0];
    //   // for watching the shared sessioni from python
    //   // which may manually remove images on client. special case
    //   if (!SessionManager.getOtherSession()) {
    //     _dispatch(actionCreator(doc));
    //   }
    // }
    // },
  });
}

export function mongoResumeSelfDB(collection, actionType) {
  const sessionID = SessionManager.getSuitableSession();
  const docs = collection.find({ sessionID }).fetch();
  if (docs.length > 0) {
    const doc = docs[0];
    _dispatch(actionCreator(doc, actionType));
  }
}

export function mongoUpsert(collection, newDocObject, actionSubType) {
  newDocObject.actionSubType = actionSubType;
  const sessionID = SessionManager.getSuitableSession();
  const docs = collection.find({ sessionID }).fetch();
  if (docs.length > 0) {
    const doc = docs[0];
    const docID = doc._id;
    collection.update(docID, { $set: newDocObject });
  } else {
    newDocObject.sessionID = sessionID;
    // const docID =
    collection.insert(newDocObject);
  }
}
