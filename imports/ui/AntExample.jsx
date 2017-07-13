// import App from 'grommet/components/App';
// import Split from 'grommet/components/Split';

import React, { Component, PropTypes } from 'react';

// try bower first
// import App from 'grommet/components/App';
// import Button from 'grommet/components/Button';
// import Header from 'grommet/components/Header';
// import Section from 'grommet/components/Section'
// import FileBrowser from 'react-keyed-file-browser'
// import { Button } from 'antd';
import Button from 'antd/lib/button';  // for js
import { Card } from 'antd';
import { Meteor } from 'meteor/meteor';

// import { Tasks } from '../api/tasks.js';

// import 'antd/lib/button/style/css';        // for css, or /style for less

// @import '~antd-mobile/lib/button/style/index.less';
// @import "your-theme-file"; // 用于覆盖上面定义的变量

import Moment from 'moment'

// Task component - represents a single todo item
export default class Example extends Component {

  constructor(props) {
    super(props);

    this.state = {
         ...this.state,
         files:[
           {
             key: 'cat2.png',
             modified: +Moment().subtract(1, 'hours'),
             size: 1.5 * 1024 * 1024
           },
           {
             key: 'kitten.png',
             modified: +Moment().subtract(3, 'days'),
             size: 545 * 1024
           },
           {
             key: 'elephant.png',
             modified: +Moment().subtract(3, 'days'),
             size: 52 * 1024
           },
         ],
         browserOpened: false,
       };
  }

  onBrowserClick = () => {
      console.log("open/close file browser")

      Meteor.call('queryFileList');

      if (!this.state.browserOpened) {
        this.setState({browserOpened: true});
      } else {
        this.setState({browserOpened: false});
      }
    }


  // onBrowserClick(){
  //   console.log("open/close file browser")
  //   if (!this.state.browserOpened) {
  //     this.setState({browserOpened: true});
  //   } else {
  //     this.setState({browserOpened: false});
  //   }
  // }

  fileClick(){
    console.log("choose the first file");
    this.setState({files:[]});
    // if (!this.state.browserOpened) {
    //   this.setState({browserOpened: true});
    // } else {
    //   this.setState({browserOpened: false});
    // }
  }

  //large={true}
  render() {
    return (
      <div>
        <Button type="primary" onClick={this.onBrowserClick}>Primary</Button>
        <Card style={{ width: 300 }}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
        </Card>

      </div>

    );
  }
}

// Task.propTypes = {
//   // This component gets the task to display through a React prop.
//   // We can use propTypes to indicate it is required
//   task: PropTypes.object.isRequired,
// };
