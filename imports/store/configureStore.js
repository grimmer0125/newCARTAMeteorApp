
// import { Platform } from 'react-native';
// import devTools from 'remote-redux-devtools';

import { createStore, applyMiddleware, compose } from 'redux';
// import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';


import rootReducer from '../reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// import rootSaga from '../sagas';

export default function configureStore(initialState) {
  // const sagaMiddleware = createSagaMiddleware();

  const middleware = applyMiddleware(thunk);

  let enhancer;
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(
    middleware,
    // window.devToolsExtension ? window.devToolsExtension() : f => f,
  );

  const store = createStore(
    rootReducer,
    initialState,
    enhancer,
  );

  // sagaMiddleware.run(rootSaga);

  return store;
}