import React, { Component, PropTypes } from 'react';

// import { Button } from 'antd';
import Button from 'antd/lib/button';  // for js
import { Card } from 'antd';
import { Meteor } from 'meteor/meteor';

import '../api/methods.js';

import { Responses } from '../api/responses.js';

// import 'antd/lib/button/style/css';        // for css, or /style for less

// @import '~antd-mobile/lib/button/style/index.less';
// @import "your-theme-file"; // 用于覆盖上面定义的变量

import Moment from 'moment'

// Task component - represents a single todo item
export default class Example extends Component {

  constructor(props) {
    super(props);

    //TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup
    Meteor.call("getSessionId", function(err, session_id) {
      console.log("getSessionId return:", session_id);

      //TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      //subscribe special Collection,
      Meteor.subscribe("commandResponse", session_id); //changed???

      Tracker.autorun(() => {
        let responses = Responses.find().fetch();
        console.log("get responses count:", responses.length, ";content:", responses);
      });

    });

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

      Meteor.call('queryFileList', (error, result) => {
        console.log("get result:", result);
      });

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

    Meteor.call('queryFileList', (error, result) => {
      console.log("get result2:", result);
    });

    console.log("choose the first file");
    // this.setState({files:[]});


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
        <Button type="primary" onClick={this.onBrowserClick}>Query File list</Button>
        {/* <Button type="primary" onClick={this.fileClick}>Primary2</Button> */}

        <Card style={{ width: 300 }}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
        </Card>

      </div>

    );
  }
}
