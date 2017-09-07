import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Backspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import IconButton from 'material-ui/IconButton';
// import FontIcon from 'material-ui/FontIcon';
// import 'font-awesome/css/font-awesome.css';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      username: '',
      password: '',
      signUp: false,
      errorTextUser: '',
      errorTextPwd: '',
    };
  }
  _notificationSystem: null
  handleSubmit = (event) => {
    event.preventDefault();
    const username = this.state.username;
    const password = this.state.password;
    if (!username) {
      this.setState({ errorTextUser: 'Enter a username' });
      return;
    }
    if (this.state.signUp) {
      console.log('ABOUT TO SIGN UP');
      Accounts.createUser({
        username,
        password,
      }, (err) => {
        if (err) {
          console.log(err.reason);
          if (!password) {
            this.setState({ errorTextPwd: 'Enter a password' });
          } else if (err.reason === 'Username already exists.') {
            this.setState({ errorTextUser: err.reason });
          }
        } else {
          this.props.handleLogin();
        }
      });
    } else {
      console.log('SIGN IN CLICKED, EVENT: ', username, 'WITH PWD: ', password);
      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          console.log(err.reason);
          if (err.reason === 'User not found') {
            this.setState({ errorTextUser: 'Enter a valid username' });
          } else if (err.reason === 'Incorrect password') {
            if (!password) {
              this.setState({ errorTextPwd: 'Enter a password' });
            } else {
              this.setState({ errorTextPwd: 'Wrong password. Try again.' });
            }
          }
        } else {
          console.log('SIGN IN SUCCESS');
          this.props.handleLogin();
        }
      });
    }
  }
  handleGoogleSignIn = () => {
    Meteor.loginWithGoogle((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('GOOGLE LOG IN SUCCESS');
        this.props.handleLogin();
      }
    });
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
    this.setState({ signUp: true });
  }
  navBack = () => {
    this.setState({ signUp: false });
  }
  render() {
    const logo = 'https://raw.githubusercontent.com/CARTAvis/deploytask/master/carta-distro/etc/carta.png';
    const loginForm = (
      <form onSubmit={this.handleSubmit}>
        <TextField
          style={{ marginLeft: '30px' }}
          errorText={this.state.errorTextUser}
          name="username"
          value={this.state.username}
          onChange={this.handleUsername}
          floatingLabelText="Username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          errorText={this.state.errorTextPwd}
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
          style={{ marginLeft: '60%', marginBottom: '10px' }}
        /><br />
        <Divider />
        <RaisedButton
          onClick={this.handleGoogleSignIn}
          // icon={<FontIcon className="fa-google-plus-square" />}
          label="sign in with google"
          backgroundColor="#1976D2"
          fullWidth
          labelColor="#FFFFFF"
          style={{ marginTop: '10px' }}
        /><br />
        <FlatButton
          hoverColor="none"
          style={{ marginLeft: '30px', marginTop: '70px' }}
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
          errorText={this.state.errorTextUser}
          value={this.state.username}
          onChange={this.handleUsername}
          floatingLabelText="Username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          floatingLabelText="Password"
          name="password"
          errorText={this.state.errorTextPwd}
          value={this.state.password}
          onChange={this.handlePassword}
          type="password"
        /><br />
        <IconButton style={{ marginLeft: '10px' }}>
          <Backspace onTouchTap={this.navBack} />
        </IconButton>
        <RaisedButton
          type="submit"
          label="sign up"
          backgroundColor="#1976D2"
          labelColor="#FFFFFF"
          style={{ marginLeft: '45%' }}
        /><br />
      </form>
    );
    return (
      <div>
        <img src={logo} alt="" height={150} width={150} style={{ margin: 'auto', display: 'block' }} />
        <div style={{ marginTop: '20px' }}>
          <Paper style={{ marginTop: '20px', height: '450px', width: '350px', margin: 'auto' }}>
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
