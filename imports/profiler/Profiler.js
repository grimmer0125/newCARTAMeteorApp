import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from './actions';
import api from '../api/ApiService';

class Profiler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props.dispatch(actions.setupProfiler());
    // this.getRef = this.getRef.bind(this);
  }
  componentDidMount = () => {
    console.log('componentDidMount', this.props);
    let trace1 = {
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
      // console.log('hover event: ', e);
      this.props.dispatch(actions.onHover(e));
    });
    this.el.on('plotly_relayout', (e) => {
      if (!e.width) {
        this.props.dispatch(actions.onZoomPan(e));
      }
      // if (this.relayoutEvent !== e) {
      //   this.props.dispatch(actions.onZoomPan(e));
      //   this.relayoutEvent = e;
      // }
    });
  }
  componentWillReceiveProps = (nextProps) => {
    console.log('Profiler nextProps:', nextProps);
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
  render() {
    return (
      <div style={{ marginTop: '15px' }} ref={(el) => { this.el = el; }} id="profiler" />
    );
  }
}
const mapStateToProps = state => ({
  profileData: state.ProfilerDB.profileData,
  data: state.ProfilerDB.data,
  zoomPanData: state.ProfilerDB.zoomPanData,
});
export default connect(mapStateToProps)(Profiler);
