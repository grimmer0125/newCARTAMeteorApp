// import App from 'grommet/components/App';
// import Split from 'grommet/components/Split';

import React, { Component, PropTypes } from 'react';

// try bower first
import App from 'grommet/components/App';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section'
import FileBrowser from 'react-keyed-file-browser'

import Moment from 'moment'

  // <Split
  //   sidebar
  //     <Header>
  //       <Button>
  //         <Icon />
  //       </Button>
  //       <Title> </Title>
  //        <Button>
  //         <Icon />
  //       </Button>
  //     </Header>

  // <Article primary={true}>
  //   <Header
  //     button

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
        //  files: [
        //    {
        //      key: 'photos/animals/cat in a hat.png',
        //      modified: +Moment().subtract(1, 'hours'),
        //      size: 1.5 * 1024 * 1024,
        //    },
        //    {
        //      key: 'photos/animals/kitten_ball.png',
        //      modified: +Moment().subtract(3, 'days'),
        //      size: 545 * 1024,
        //    },
        //    {
        //      key: 'photos/animals/elephants.png',
        //      modified: +Moment().subtract(3, 'days'),
        //      size: 52 * 1024,
        //    },
        //    {
        //      key: 'photos/funny fall.gif',
        //      modified: +Moment().subtract(2, 'months'),
        //      size: 13.2 * 1024 * 1024,
        //    },
        //    {
        //      key: 'photos/holiday.jpg',
        //      modified: +Moment().subtract(25, 'days'),
        //      size: 85 * 1024,
        //    },
        //    {
        //      key: 'documents/letter chunks.doc',
        //      modified: +Moment().subtract(15, 'days'),
        //      size: 480 * 1024,
        //    },
        //    {
        //      key: 'documents/export.pdf',
        //      modified: +Moment().subtract(15, 'days'),
        //      size: 4.2 * 1024 * 1024,
        //    },
        //  ],
       };
  }

  onBrowserClick(){
    console.log("open/close file browser")
    if (!this.state.browserOpened) {
      this.setState({browserOpened: true});
    } else {
      this.setState({browserOpened: false});
    }
  }

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
      <App centered={false}>
          {/* <Header direction="row" justify="between"
           pad={{horizontal: 'medium'}}>

          </Header> */}
          <Section>
            <Button
              label='Click to open file browser'
              onClick={(e)=>{this.onBrowserClick(e)}}
            />
            <Button
              label='Click to choose first file'
              onClick={(e)=>{this.fileClick(e)}}
            />

            { this.state.browserOpened &&
            <FileBrowser
              detailRenderer={null}
              files={this.state.files}
            />
            }
          </Section>


      </App>
    );
  }
}

// Task.propTypes = {
//   // This component gets the task to display through a React prop.
//   // We can use propTypes to indicate it is required
//   task: PropTypes.object.isRequired,
// };
