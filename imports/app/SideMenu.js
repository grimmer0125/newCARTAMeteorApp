import React, { Component } from 'react';
import MenuItemMUI from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
import Backspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import Folder from 'material-ui/svg-icons/file/folder';
import Run from 'material-ui/svg-icons/maps/directions-run';

import FileBrowser from '../fileBrowser/FileBrowser';

const openWidth = 220;
const closeWidth = 56;

export default class SideMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 56,
      openFiles: false,
      openBrowser: false,
      expand: false,
    };
  }
  handleToggle = () => {
    // this.props.handleExpand();
    this.setState({ expand: !this.state.expand });
  }
  handleLogout = () => {
    this.props.handleLogout();
  }
  handleOpenFiles = () => {
    // this.props.expandToTrue();
    this.setState({
      width: this.state.openWidth,
      openFiles: !this.state.openFiles,
      openBrowser: !this.state.openBrowser,
      expand: true,
    });
  }
  handleNavBack = () => {
    this.setState({
      openFiles: !this.state.openFiles,
      openBrowser: !this.state.openBrowser,
    });
  }
  render() {
    let width = 0;
    if (this.state.expand) {
      width = openWidth;
    } else {
      width = closeWidth;
    }
    // margin: 'auto', left: '10%'
    // margin: 'auto', right: '10%'
    const buttonStyle1 = { bottom: '10px', position: 'absolute' };
    const buttonStyle2 = { bottom: '10px', position: 'absolute' };
    const menu = (
      <div>
        <MenuItemMUI style={{ overflowX: 'hidden' }} onClick={this.handleOpenFiles} primaryText="Files" leftIcon={<Folder />} />
        <MenuItemMUI style={{ overflowX: 'hidden' }} onClick={this.handleLogout} primaryText="Sign out" leftIcon={<Run />} />
        {
          this.state.expand ?
            <IconButton style={buttonStyle2} onClick={this.handleToggle}>
              <NavBefore />
            </IconButton>
            :
            <IconButton style={buttonStyle1} onClick={this.handleToggle}>
              <NavNext />
            </IconButton>
        }
      </div>
    );
    const style = {
      width,
      opacity: 0.8,
      borderRight: 'solid',
      borderRightWidth: '1px',
      borderRightColor: 'grey',
      height: '100vh',
      float: 'left',
    };
    return (
      <div
        style={style}
      >
        {
          this.state.openFiles ?
            <div>
              <IconButton onClick={this.handleNavBack}>
                <Backspace />
              </IconButton>
              <FileBrowser openBrowser={this.state.openBrowser} />
            </div>
            : menu
        }
      </div>
    );
  }
}
