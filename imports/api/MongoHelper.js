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
