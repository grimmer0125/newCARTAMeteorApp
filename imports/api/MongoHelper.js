import SessionManager from '../api/SessionManager';

export function setupMongoListeners(collection, dispatch, handler) {
  const collectionObservationHandle = collection.find().observe({
    added(newDoc) {
      dispatch(handler(newDoc));
    },
    changed(newDoc, oldDoc) {
      dispatch(handler(newDoc));
    },
    removed(oldDocument) {
      const documents = collection.find().fetch();
      if (documents.length > 0) {
        const doc = documents[0];
        dispatch(handler(doc));
      }
    },
  });
}

export function mongoUpsert(collection, newDocObject, actionType) {
  newDocObject.actionType = actionType;
  const sessionID = SessionManager.getSuitableSession();
  const docs = collection.find({ sessionID }).fetch();
  if (docs.length > 0) {
    console.log('collection update');
    const doc = docs[0];
    const docID = doc._id;
    collection.update(docID, { $set: newDocObject });
  } else {
    console.log('collection insert');
    newDocObject.sessionID = sessionID;
    const docID = collection.insert(newDocObject);
  }
}
