import React, { Component } from 'react';
import actions from './actions';
import { connect } from 'react-redux';

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
