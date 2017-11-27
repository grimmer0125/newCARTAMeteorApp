import React, { Component } from 'react';
import actions from './actions';
import { connect } from 'react-redux';

class Colormap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        Hello Colormap!!
      </div>
    );
  }
}


const mapStateToProps = state => ({
  ColormapDB: state.ColormapDB,
});

export default connect(mapStateToProps)(Colormap);
