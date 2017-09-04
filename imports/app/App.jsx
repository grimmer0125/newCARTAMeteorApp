
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Meteor } from 'meteor/meteor';
import ReactMeteorData from 'meteor/react-meteor-data';
import React, { Component } from 'react';
// import React, { Component } from 'react';

import { Provider } from 'react-redux';
import configureStore from './configureStore';
import ImageViewer from '../imageViewer/ImageViewer';
// import FileBrowser from '../fileBrowser/FileBrowser';
import Main from './Main';
import Login from './Login.jsx';
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

// const App = () => (
//   <Provider store={store}>
//     <MuiThemeProvider muiTheme={muiTheme}>
//       <div>
//         <Login />
//       </div>
//     </MuiThemeProvider>
//   </Provider>
// );
class App extends Component {
  mixins: [ReactMeteorData];
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
  }
  // getMeteorData = () => ({
  //   currentUser: Meteor.user(),
  // })
  render() {
    let toReturn;
    // const currentUser = this.data;
    // console.log('CURRENTUSER: ', currentUser);
    if (Meteor.user()) {
      console.log('CURR USER:', Meteor.user());
      toReturn = <Main />;
    } else {
      console.log('INSIDE LOGIN COMPONENT');
      toReturn = <Login />;
    }
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            {toReturn}
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }
}
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
