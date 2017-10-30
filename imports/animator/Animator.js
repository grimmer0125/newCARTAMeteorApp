import React, { Component } from 'react';
// import actions from './actions';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import { Tabs, Tab } from 'material-ui/Tabs';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItemMUI from 'material-ui/MenuItem';
import NumericInput from 'react-numeric-input';
import Slider from 'material-ui/Slider';
import IconButton from 'material-ui/IconButton';
import SkipPrev from 'material-ui/svg-icons/av/skip-previous';
import SkipNext from 'material-ui/svg-icons/av/skip-next';
import Stop from 'material-ui/svg-icons/av/stop';
import PlayForward from 'material-ui/svg-icons/av/play-arrow';

class Animator extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.props.dispatch(actions.setupHistogram());
  }
  render() {
    const string = 'Image';
    const label = <div>{string}<br /><sub>image 0</sub></div>;
    return (
      <div>
        <Paper style={{ width: 482, height: 200, backgroundColor: 'lightgrey' }} zDepth={2}>
          <Tabs>
            <Tab label={label} />
            <Tab label="Channel" />
            <Tab label="Stokes" />
          </Tabs>
          <div style={{ display: 'flex', flexDirection: 'row', height: '20%' }}>
            <DropDownMenu value={1} underlineStyle={{ color: 'black' }}>
              <MenuItemMUI value={1} primaryText="Image 0" />
            </DropDownMenu>
            <p>&#8804; 3</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', height: '20%' }}>
            <div style={{ marginTop: '15px' }}>
              <NumericInput style={{ wrap: { height: '30px', width: '50px' }, input: { height: '30px', width: '50px' } }} min={0} max={3} value={0} />
            </div>
            <div>
              <Slider sliderStyle={{ width: '350px', left: '10px', height: '2px' }} step={1} min={0} max={3} value={3} />
            </div>
            <div style={{ marginLeft: '30px', marginTop: '15px' }}>
              <NumericInput style={{ wrap: { height: '30px', width: '50px' }, input: { height: '30px', width: '50px' } }} min={0} max={3} value={3} />
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row', height: '50%', margin: 'auto', width: '40%' }}>
            <IconButton style={{ transform: 'rotate(180deg)' }}>
              <PlayForward />
            </IconButton>
            <IconButton>
              <SkipPrev />
            </IconButton>
            <IconButton>
              <Stop />
            </IconButton>
            <IconButton>
              <SkipNext />
            </IconButton>
            <IconButton>
              <PlayForward />
            </IconButton>
          </div>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.HistogramDB.data,
});

export default connect(mapStateToProps)(Animator);
