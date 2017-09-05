
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { connect } from 'react-redux';

import React from 'react';
// import React, { Component } from 'react';

import { Provider } from 'react-redux';
import configureStore from './configureStore';
import ImageViewer from '../imageViewer/ImageViewer';
// import FileBrowser from '../fileBrowser/FileBrowser';
import Main from './Main';
import SessionUI from './SessionUI';

import actions from './actions';

const store = configureStore();
injectTapEventPlugin();


// import { grey400 } from 'material-ui/styles/colors';

// ref
// 1. https://github.com/callemall/material-ui/blob/master/src/styles/getMuiTheme.js
// 2. http://www.material-ui.com/#/customization/themes

// primaryColor: palette.primary1Color, not effect for RaisedButton, why?
// primaryTextColor: palette.alternateTextColor
// secondaryColor: palette.accent1Color,

// these primary and accent colosr are from https://grommet.github.io
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#865CD6', // grey400,
    accent1Color: '#DC2878', // ~ its meaning is the same as secondary and the following secondary*Color do not take effect
    // secondaryColor: '#DC2878',
    //     secondaryTextColor: '#DC2878',
    //     secondaryIconColor: '#DC2878',
  },
  // appBar: {
  //   height: 50,
  // },
});

const App = () => (
  <Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <div>
        <div className="layout-row-end-center ">
          <SessionUI />
        </div>

        <Main />
        {/* <ImageViewer /> */}
      </div>
    </MuiThemeProvider>
  </Provider>
);

store.dispatch(actions.waitForCommandResponses());


export default App;
// export default class App extends Component {
//   render() {
//     return (
//       <Provider store={store}>
//         <MuiThemeProvider muiTheme={muiTheme}>
//           <FileBrowser />
//         </MuiThemeProvider>
//       </Provider>
//     );
//
//     // return (
//     //   <div className="container">
//     //   </div>
//     // );
//   }
// }

// App.propTypes = {
//   tasks: PropTypes.array.isRequired,
// };

// export default createContainer(() => {
//   let test = Tasks.find({}, { sort: { createdAt: -1 } }).fetch();
//   console.log("task:", test);
//   console.log("task num:", test.length);
//   return {
//     tasks: test,
//   };
// }, App);
