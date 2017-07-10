// import App from 'grommet/components/App';
// import Split from 'grommet/components/Split';

import React, { Component, PropTypes } from 'react';

// try bower first
import App from 'grommet/components/App';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';

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

  onClick(){

  }

  render() {
    return (
      <App centered={false}>
          <Header direction="row" justify="between"
            large={true} pad={{horizontal: 'medium'}}>
            <Button
              label='Label'
              onClick={this.onClick}
               />
          </Header>
      </App>
    );
  }
}

// Task.propTypes = {
//   // This component gets the task to display through a React prop.
//   // We can use propTypes to indicate it is required
//   task: PropTypes.object.isRequired,
// };
