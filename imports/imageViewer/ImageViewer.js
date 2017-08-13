import React, { Component } from 'react';

import Paper from 'material-ui/Paper';

import { connect } from 'react-redux';
import actions from './actions';

const browserStyle = {
  width: 637,
  height: 677,
};

class ImageViewer extends Component {
  constructor(props) {
    super(props);

    this.props.dispatch(actions.prepareImageViewer());
  }

  render() {
    return (
      <Paper style={browserStyle} zDepth={1} >
        <img src={this.props.imageURL} alt="" />
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  imageURL: state.image.imageURL,
});

export default connect(mapStateToProps)(ImageViewer);
