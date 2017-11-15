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
      username: '',
      password: '',
      newPwd: '',
      signUp: false,
      errorTextUserLogin: '',
      errorTextPwdLogin: '',
      errorTextUserSignup: '',
      errorTextPwdSignup: '',
    };
  }
  _notificationSystem: null
  handleSubmit = (event) => {
    event.preventDefault();
    const username = this.state.username;
    const password = this.state.password;
    // console.log('SIGN IN CLICKED, EVENT: ', username, 'WITH PWD: ', password);
    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        console.log(err.reason);
        if (!username) {
          this.setState({
            errorTextUserLogin: 'Enter a username',
          });
        } else if (err.reason === 'User not found') {
          this.setState({ errorTextUserLogin: 'Enter a valid username' });
        } else if (err.reason === 'Incorrect password') {
          if (!password) {
            this.setState({ errorTextPwdLogin: 'Enter a password' });
          } else {
            this.setState({ errorTextPwdLogin: 'Wrong password. Try again.' });
          }
        }
      } else {
        // console.log('SIGN IN SUCCESS');
        this.props.handleLogin();
      }
    });
  }
  handleSubmitSignup = (event) => {
    event.preventDefault();
    // console.log('ABOUT TO SIGN UP');
    const confirmPwd = this.state.confirmPwd;
    const newUser = this.state.newUser;
    const newPwd = this.state.newPwd;
    if (!newUser) {
      this.setState({
        errorTextUserSignup: 'Enter a username',
      });
      return;
    } else if (!newPwd) {
      this.setState({ errorTextPwdSignup: 'Enter a password' });
      return;
    } else if (!confirmPwd) {
      this.setState({ errorTextConfirmPwdSignup: 'Confirm password' });
      return;
    } else if (confirmPwd !== newPwd) {
      this.setState({
        errorTextConfirmPwdSignup: 'Wrong password. Confirm again.',
      });
      return;
    }
    Accounts.createUser({
      username: newUser,
      password: newPwd,
    }, (err) => {
      if (err) {
        console.log(err.reason);
        if (err.reason === 'Username already exists.') {
          this.setState({ errorTextUserSignup: err.reason });
        }
      } else {
        this.props.handleLogin();
      }
    });
  }
  handleGoogleSignIn = () => {
    Meteor.loginWithGoogle((err) => {
      if (err) {
        console.log(err);
      } else {
        // console.log('GOOGLE LOG IN SUCCESS');
        this.props.handleLogin();
      }
    });
  }
  handleUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  }
  handleNewUsername = (event) => {
    this.setState({
      newUser: event.target.value,
    });
  }
  handlePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  }
  handleNewPassword = (event) => {
    this.setState({
      newPwd: event.target.value,
    });
  }
  handleConfirmPwd = (event) => {
    this.setState({
      confirmPwd: event.target.value,
    });
  }
  handleSignup = () => {
    this.setState({ signUp: true });
  }
  navBack = () => {
    this.setState({
      signUp: false,
      newUser: '',
      newPwd: '',
      confirmPwd: '',
    });
  }
  render() {
    const logo = 'https://raw.githubusercontent.com/CARTAvis/deploytask/master/carta-distro/etc/carta.png';
    const google = <img src="/images/google.png" alt="" style={{ height: '35px', width: '35px', marginLeft: 0 }} />;
    const loginForm = (
      <form onSubmit={this.handleSubmit}>
        <TextField
          style={{ marginLeft: '30px' }}
          errorText={this.state.errorTextUserLogin}
          name="username"
          value={this.state.username}
          onChange={this.handleUsername}
          floatingLabelText="Username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          errorText={this.state.errorTextPwdLogin}
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              this.handleSubmit();
            }
          }}
          style={{ marginLeft: '60%', marginBottom: '10px' }}
        /><br />
        <Divider />
        <RaisedButton
          onClick={this.handleGoogleSignIn}
          icon={google}
          label="sign in with google"
          // dd4b39
          backgroundColor="#dd4b39"
          labelColor="#FFFFFF"
          style={{ marginLeft: '20%', marginTop: '10px' }}
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
      <form onSubmit={this.handleSubmitSignup}>
        <TextField
          style={{ marginLeft: '30px' }}
          name="new username"
          errorText={this.state.errorTextUserSignup}
          value={this.state.newUser || ''}
          onChange={this.handleNewUsername}
          floatingLabelText="Create username"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          floatingLabelText="Create password"
          name="new password"
          value={this.state.newPwd}
          errorText={this.state.errorTextPwdSignup}
          onChange={this.handleNewPassword}
          type="password"
        /><br />
        <TextField
          style={{ marginLeft: '30px' }}
          floatingLabelText="Confirm password"
          name="confirm password"
          value={this.state.confirmPwd || ''}
          errorText={this.state.errorTextConfirmPwdSignup}
          onChange={this.handleConfirmPwd}
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              this.handleSubmitSignup();
            }
          }}
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
