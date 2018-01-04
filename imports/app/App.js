
import { Meteor } from 'meteor/meteor';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import NotificationSystem from 'react-notification-system';
// import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
// import ImageViewer from '../imageViewer/ImageViewer';
// import FileBrowser from '../fileBrowser/FileBrowser';
import MainPage from './MainPage';

import Login from './Login';
import actions from './actions';
// import Carousel from './Carousel';

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
// const muiTheme = getMuiTheme({
//   palette: {
//     primary1Color: '#865CD6', // grey400,
//     accent1Color: '#DC2878', // ~ its meaning is the same as secondary and the following secondary*Color do not take effect
//     // secondaryColor: '#DC2878',
//     //     secondaryTextColor: '#DC2878',
//     //     secondaryIconColor: '#DC2878',
//   },
//   // appBar: {
//   //   height: 50,
//   // },
// });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }
  handleLogin = () => {
    this.setState({ loggedIn: true });
  }
  handleLogout = () => {
    Meteor.logout((err) => {
      if (err) {
        console.log(err);
        this.notify.addNotification({
          title: 'Sign out Failure',
          message: 'Sign out failed. Try again.',
          level: 'error',
          autoDismiss: 4,
        });
      } else {
        // this.refs.notificationSystem.addNotification({
        //   title: 'Logout Failure',
        //   message: 'Sign out failed. Try again.',
        //   level: 'error',
        //   autoDismiss: 4,
        // });
        this.setState({ loggedIn: false });
      }
    });
  }
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider>
          <div>
            {
              (this.state.loggedIn || Meteor.user() !== null) ?
                <MainPage handleLogout={this.handleLogout} />
                : <Login handleLogin={this.handleLogin} />
            }
            {/* <Carousel /> */}
            <NotificationSystem ref={(node) => { this.notify = node; }} />
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }
}
store.dispatch(actions.setupResponseChannnelAndAllDB());


export default App;
