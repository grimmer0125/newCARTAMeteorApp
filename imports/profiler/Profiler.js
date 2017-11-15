import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import actions from './actions';
// import api from '../api/ApiService';

class Profiler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveAsInput: '',
      src: '',
    };
    this.props.dispatch(actions.setupProfiler());
    // this.getRef = this.getRef.bind(this);
  }
  componentDidMount = () => {
    // console.log('componentDidMount', this.props);
    const trace1 = {
      // x: [1, 2, 3, 4],
      // y: [10, 15, 13, 17],
      type: 'scatter',
    };
    const layout = {
      height: 395,
    };
    const data = [trace1];
    Plotly.newPlot(this.el, data, layout);
    this.el.on('plotly_hover', (e) => {
      this.props.dispatch(actions.onHover(e));
    });
    this.el.on('plotly_relayout', (e) => {
      if (!e.width) {
        this.props.dispatch(actions.onZoomPan(e));
      }
    });
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.profileData) {
      Plotly.deleteTraces(this.el, -1);
      Plotly.addTraces(this.el, nextProps.profileData);
    }
    if (nextProps.width) {
      const layout = {
        width: nextProps.width - 20,
      };
      Plotly.relayout(this.el, layout);
    }
    if (nextProps.data) {
      Plotly.Fx.hover(this.el, [nextProps.data]);
    }
    if (nextProps.zoomPanData) {
      // console.log('ZOOMPANDATA: ', nextProps.zoomPanData);
      let data = null;
      data = {};
      if (nextProps.zoomPanData.xRange) data['xaxis.range'] = nextProps.zoomPanData.xRange;
      if (nextProps.zoomPanData.yRange) data['yaxis.range'] = nextProps.zoomPanData.yRange;
      if (nextProps.zoomPanData.xAutorange) data['xaxis.autorange'] = nextProps.zoomPanData.xAutorange;
      if (nextProps.zoomPanData.yAutorange) data['yaxis.autorange'] = nextProps.zoomPanData.yAutorange;
      // console.log('ZOOM DATA: ', data);
      Plotly.relayout(this.el, data);
    }
  }
  // getRef = (el) => {
  //   this.el = el;
  // }
  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };
  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };
  saveAs = (event) => {
    this.setState({
      saveAsInput: event.target.value,
    });
  }
  handleChange = (event, index, value) => {
    this.setState({ value });
  }
  convertToImage = () => {
    Plotly.toImage(this.el, {
      format: 'svg',
      width: 400,
      height: 400,
      filename: 'newplot',
    }).then((url) => {
      const userID = Meteor.userId();
      const decodedURL = decodeURIComponent(url.replace(/^data:image\/svg\+xml,/, ''));
      Meteor.call('convertSVGFile', decodedURL, this.state.value, userID, (error, result) => {
        let mime = '';
        if (this.state.value === 'pdf') mime = 'application/pdf';
        else mime = 'text/ps';
        const b64encoded = `data:${mime};base64, ${result}`;
        const a = document.createElement('a');
        a.setAttribute('href', b64encoded);
        a.setAttribute('download', `${this.state.saveAsInput}.${this.state.value}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Meteor.call('removeFile', this.state.value, userID);
      });
    });
  }
  render() {
    return (
      <div>
        <div style={{ marginTop: '15px' }} ref={(el) => { this.el = el; }} id="profiler" />
        <RaisedButton label="save" onClick={this.handleTouchTap} />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <TextField
            floatingLabelText="Save as..."
            onChange={this.saveAs}
            style={{ margin: '10px', verticalAlign: 'middle' }}
          /><br />
          <SelectField
            floatingLabelText="File Type"
            value={this.state.value}
            onChange={this.handleChange}
            autoWidth
            style={{ width: '150px', margin: '10px', verticalAlign: 'middle' }}
          >
            <MenuItem value="pdf" primaryText="pdf" />
            <MenuItem value="ps" primaryText="ps" />
          </SelectField>
          <br />
          <FlatButton
            type="submit"
            label="Save"
            primary
            // href={`data:text/eps;base64,${this.state.src}`}
            style={{ marginRight: 0 }}
            onClick={this.convertToImage}
          />
        </Popover>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  profileData: state.ProfilerDB.profileData,
  data: state.ProfilerDB.data,
  zoomPanData: state.ProfilerDB.zoomPanData,
});
export default connect(mapStateToProps)(Profiler);
