import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import actions from './actions';

const style = {
  margin: 12,
};

class SessionUI extends Component {
  constructor(props) {
    super(props);
    this.state = { watching: false, sessionText: 'abcd' };
  }

  handleChange = (event) => {
    console.log('event:', event.target.value);
    this.setState({
      sessionText: event.target.value,
    });
  }

  switchWatchMode = () => {
    // if(this.state.watching || this.state.sessionText) {
    //   this.setState({watching: !this.state.watching});
    // }
    if (!this.state.watching) {
      if (this.state.sessionText) {
        this.setState({ watching: true });
        // save to SeesionManger:
        this.props.dispatch(actions.turnOnWatching(this.state.sessionText));
      } else {

      }
    } else {
      this.setState({ watching: false });
      this.props.dispatch(actions.turnOffWatching());
    }

    // TODO: save to redux
  }

  render() {
    const { sessionID } = this.props;
    const buttonLabel = !this.state.watching ? 'GetScreen' : 'StopWatch';
    return (
      <div>
        <TextField
          value={this.state.sessionText}
          hintText="Input Shared Screen's SessionID"
          onChange={this.handleChange}
        />
        <RaisedButton onTouchTap={this.switchWatchMode} label={buttonLabel} style={style} />
        SelfSessionID: {sessionID}
      </div>
    );
  }
}


// let SessionUI = ({ sessionID }) => {
//   return (
//     <div>
//       <TextField
//         value="abc"
//         hintText="Input Shared Screen's SessionID"
//         onChange={handleChange}
//       />
//       <RaisedButton onTouchTap={this.switchShareMode} label="Get Screen" style={style} />
//       SelfSessionID: {sessionID}
//     </div>
//   )
// }

const mapStateToProps = state => ({
  // imageURL: state.image.imageURL,
  sessionID: state.sessionID,
});

export default connect(mapStateToProps)(SessionUI);

// export default SessionUI;
