import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import App from './App.jsx';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      username: '',
      password: '',
      signUp: false,
    };
  }
  handleSubmit = (event) => {
    event.preventDefault();
    // const username = e.find('[name=username]').val();
    // const password = e.find('[name=password]').val();
    const username = this.state.username;
    const password = this.state.password;
    if (this.state.signUp) {
      Accounts.createUser({
        username,
        password,
      }, (err) => {
        if (err) {
          console.log(err.reason);
        }
      });
      this.props.handleLogin();
    } else {
      console.log('SIGN IN CLICKED, EVENT: ', username, 'WITH PWD: ', password);
      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          console.log(err.reason);
        } else {
          console.log('SIGN IN SUCCESS');
          this.props.handleLogin();
        }
      });
    }
  }
  handleUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  }
  handlePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  }
  handleSignup = () => {
    this.setState({
      signUp: true,
    });
  }
  render() {
    const logo = 'https://raw.githubusercontent.com/CARTAvis/deploytask/master/carta-distro/etc/carta.png';
    const loginForm = (
      <form onSubmit={this.handleSubmit}>
        <TextField
          style={{ marginLeft: '30px' }}
          name="username"
          value={this.state.username}
          onChange={this.handleUsername}
          floatingLabelText="Username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          floatingLabelText="Password"
          name="password"
          value={this.state.password}
          onChange={this.handlePassword}
          type="password"
        /><br />
        <RaisedButton
          type="submit"
          label="sign in"
          backgroundColor="#1976D2"
          labelColor="#FFFFFF"
          style={{ marginLeft: '60%' }}
        /><br />
        <FlatButton
          hoverColor="none"
          style={{ marginLeft: '30px', marginTop: '90px' }}
          label="sign up"
          onClick={this.handleSignup}
          rippleColor="#82B1FF"
          labelStyle={{ color: '#1976D2' }}
        />
      </form>
    );
    const signupForm = (
      <form onSubmit={this.handleSubmit}>
        <TextField
          style={{ marginLeft: '30px' }}
          name="username"
          value={this.state.username}
          onChange={this.handleUsername}
          floatingLabelText="Username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          floatingLabelText="Password"
          name="password"
          value={this.state.password}
          onChange={this.handlePassword}
          type="password"
        /><br />
        <RaisedButton
          type="submit"
          label="sign up"
          backgroundColor="#1976D2"
          labelColor="#FFFFFF"
          style={{ marginLeft: '60%' }}
        /><br />
      </form>
    );
    return (
      <div>
        <img src={logo} alt="" height={150} width={150} style={{ margin: 'auto', display: 'block' }} />
        <div style={{ marginTop: '20px' }}>
          <Paper style={{ marginTop: '20px', height: '350px', width: '350px', margin: 'auto' }}>
            {
              this.state.signUp ? signupForm
                : loginForm
            }
          </Paper>
        </div>
      </div>
    );
  }
}

export default Login;
