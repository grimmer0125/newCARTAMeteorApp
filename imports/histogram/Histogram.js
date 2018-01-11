import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import actions from './actions';

class Histogram extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props.dispatch(actions.setupHistogram());
  }
  componentDidMount = () => {
    // console.log('componentDidMount', this.props);
    const trace1 = {
      // x: [1, 2, 3, 4],
      // y: [10, 15, 13, 17],
      type: 'bar',
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
    if (nextProps.histogramData) {
      Plotly.deleteTraces(this.el, -1);
      const data = [{
        x: nextProps.histogramData.x,
        y: nextProps.histogramData.y,
        type: 'bar',
      }];
      const layout = {
        // height: 395,
        bargap: 0,
        yaxis: {
          type: 'log',
          autorange: true,
        },
      };
      Plotly.addTraces(this.el, data);
      Plotly.relayout(this.el, layout);
      // this.el.on('plotly_hover', (e) => {
      //   console.log('HOVER');
      //   this.props.dispatch(actions.onHover(e));
      // });
    }
    if (nextProps.width) {
      const layout = {
        width: nextProps.width - 20,
        bargap: 0,
        yaxis: {
          type: 'log',
          autorange: true,
        },
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
      const layout = {
        bargap: 0,
        yaxis: {
          type: 'log',
          autorange: true,
        },
      };
      Plotly.relayout(this.el, data, layout);
    }
  }
  render() {
    return (
      <div>
        <div
          style={{ marginTop: '15px' }}
          ref={(el) => {
            this.el = el;
          }}
          id="histogram"
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  // data: state.HistogramDB.data,
  histogramData: state.HistogramDB.histogramData,
  data: state.HistogramDB.data,
  zoomPanData: state.HistogramDB.zoomPanData,
});

export default connect(mapStateToProps)(Histogram);


// import {a, b a, c } from a.js
//
// import testtest from a.js
