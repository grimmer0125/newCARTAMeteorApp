import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

// import ToggleIconButtonWidget from 'paraviewweb/src/React/Widgets/ToggleIconButtonWidget';
// https://github.com/Kitware/paraviewweb/tree/437c073cdd977c01b2486996f6986f30dcf2045b/src/React/Widgets/FileBrowserWidget

// import Meter from 'grommet/components/Meter';

import { Tasks } from '../api/tasks.js';
import Task from './Task.jsx';

// import ParaviewSample from './ParaviewSample.jsx'
// import GrommetExample from './GrommetExample.jsx'
import AntExample from './AntExample.jsx'

// App component - represents the whole app
class App extends Component {
  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text,
      createdAt: new Date(), // current time
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  renderTasks() {
    return this.props.tasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {

    return (
      // <GrommetExample></GrommetExample>
      // <ParaviewSample></ParaviewSample>
      <AntExample></AntExample>

    );

    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>

          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
           <input
             type="text"
             ref="textInput"
             placeholder="Type to add new tasks"
           />
          </form>
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default createContainer(() => {
  let test = Tasks.find({}, { sort: { createdAt: -1 } }).fetch();
  console.log("task:", test);
  console.log("task num:", test.length);
  return {
    tasks: test,
  };
}, App);
