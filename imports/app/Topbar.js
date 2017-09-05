import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import More from 'material-ui/svg-icons/navigation/more-horiz';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
// import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';

import TextField from 'material-ui/TextField';

export default class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  handleClose = () => {
    this.setState({ open: false });
  };
  handleConfig = (event) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };
  handleLogout = () => {
    this.props.handleLogout();
  }
  render() {
    const style = {
      minWidth: 10,
    };
    return (
      <div>
        <Toolbar style={this.props.style}>
          <ToolbarGroup firstChild>
            {/* <DropDownMenu value={this.state.value} onChange={this.handleChange}>
            <MenuItemMUI value={1} primaryText="All Broadcasts" />
            <MenuItemMUI value={2} primaryText="All Voice" />
            <MenuItemMUI value={3} primaryText="All Text" />
          </DropDownMenu> */}
          </ToolbarGroup>
          <ToolbarGroup>
            <RaisedButton style={style} label="sign out" onClick={this.handleLogout} />
            <RaisedButton style={style} label="Local" />
            <ToolbarSeparator style={{ margin: 0 }} />
            <RaisedButton style={style} label="Remote" />
            <IconButton iconStyle={{ margin: 0 }} onClick={this.handleConfig}>
              <More />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleClose}
        >
          <div style={{ margin: '5px' }}>
            <TextField
              floatingLabelText="IP/Domain"
            /><br />
            <FlatButton
              label="Apply"
              primary
              style={{ left: '70%' }}
              onClick={this.handleClose}
            />
          </div>
        </Popover>
      </div>
    );
  }
}
