import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import FileBrowserWidget from 'paraviewweb/src/React/Widgets/FileBrowserWidget';

// Load CSS
// require('normalize.css');
// import 'font-awesome/css/font-awesome.css';

// var https = Npm.require('https'); ??
// const GitTreeWidget = require('paraviewweb/src/React/Widgets/GitTreeWidget/index.js');


// require('font-awesome/css/font-awesome.css');
// import ToggleIconButtonWidget from 'paraviewweb/src/React/Widgets/ToggleIconButtonWidget';
// import GitTreeWidget from 'paraviewweb/src/React/Widgets/GitTreeWidget/index';

// console.log(GitTreeWidget);

const nodes = [
  { name: 'another branch',          visible: true,  id: '40',  parent: '1'     },
  { name: 'child of branch',         visible: false, id: '50',  parent: '40'    },
  { name: 'branch of branch',        visible: true,  id: '51',  parent: '40'    },
  { name: 'actually the final node', visible: true,  id: '30',  parent: '20'    },
  { name: 'other node',              visible: true,  id:'1',    parent: '199'   },
  { name: 'top node',                visible: false, id: '199', parent: '0'     },
  { name: 'branched node',           visible: false, id: '10',  parent: '1'     },
  { name: 'branched node child',     visible: false, id: '11',  parent: '10'    },
  { name: 'final node',              visible: true,  id: '20',  parent: '1'     },
];


// document.body.style.margin = 0;
// document.body.style.padding = 0;
// document.querySelector('.content').style.height = '98vh';
// function onAction(type, files, aaa) {
//     console.log(type, files, aaa);
// }

function onChange(value, name) {
    console.log(name, ' => ', value);
}

// export default class ParaviewSample extends Component {
export default React.createClass({

  render() {
      return (
        <div>
          <h1>Test</h1>
          {/* <ToggleIconButtonWidget name="wifi" icon="fa-wifi" value onChange={ onChange } />
          <ToggleIconButtonWidget name="btooth" icon="fa-bluetooth" value={ false } onChange={ onChange } />
          <ToggleIconButtonWidget name="a" icon="fa-at" onChange={ onChange } />
          <ToggleIconButtonWidget name="b" icon="fa-ban" toggle onChange={ onChange } />
          <ToggleIconButtonWidget name="check" icon="fa-check-square-o" iconDisabled="fa-square-o" onChange={ onChange } /> */}
        </div>
      );

  }
});
    // React.createElement(
    //     FileBrowserWidget,
    //     {
    //     directories: ['a', 'b', 'c'],
    //     groups: [
    //         { label: 'd', files: ['da', 'db', 'dc']},
    //         { label: 'e', files: ['ea', 'eb', 'ec']},
    //         { label: 'f', files: ['fa', 'fb', 'fc']},
    //     ],
    //     files: ['g', 'h', 'i', 'Super long name with not much else bla bla bla bla bla bla bla bla bla bla bla bla.txt'],
    //     onAction,
    //     path: ['Home', 'subDir1', 'subDir2', 'subDir3'],
    //     }),
    // document.querySelector('.content'));
