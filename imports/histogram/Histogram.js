import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from './actions';

class Histogram extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props.dispatch(actions.setupHistogram());
  }
  render() {
    return (
      <div>
        <p>Histogram</p>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.HistogramDB.data,
});

export default connect(mapStateToProps)(Histogram);


// import {a, b a, c } from a.js
//
// import testtest from a.js
