import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey400 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#865CD6', // grey400,
  },
  // appBar: {
  //   height: 50,
  // },
});

import MyAwesomeReactComponent from './MyAwesomeReactComponent';

export default class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <MyAwesomeReactComponent />
      </MuiThemeProvider>

    );

    // return (
    //   <div className="container">
    //   </div>
    // );
  }
}

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
