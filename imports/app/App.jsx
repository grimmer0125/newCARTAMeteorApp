
import { Meteor } from 'meteor/meteor';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React, { Component } from 'react';
// import React, { Component } from 'react';

import { Provider } from 'react-redux';
import configureStore from './configureStore';
// import ImageViewer from '../imageViewer/ImageViewer';
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
// Name = React.createClass({
//
//   render() {
//     return <App user={this.data.currentUser} />;
//   },
// });
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      loggedIn: false,
    };
  }
  handleLogin = () => {
    this.setState({ loggedIn: true });
  }
  handleLogout = () => {
    console.log('INSIDE APP handleLogout');
    Meteor.logout((err) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({ loggedIn: false });
      }
    });
  }
  render() {
    console.log('LOGGED IN STATE: ', this.state.loggedIn);
    // if (!this.state.loggedIn && (Meteor.user() !== null)) {
    //   return (
    //     <Provider store={store}>
    //       <MuiThemeProvider muiTheme={muiTheme}>
    //         <div>
    //           <Login handleLogin={this.handleLogin} />
    //         </div>
    //       </MuiThemeProvider>
    //     </Provider>
    //   );
    // }
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            {
              (this.state.loggedIn || Meteor.user() !== null) ?
                <Main handleLogout={this.handleLogout} />
                : <Login handleLogin={this.handleLogin} />
            }
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
