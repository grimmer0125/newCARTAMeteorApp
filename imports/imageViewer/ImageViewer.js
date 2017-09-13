import React, { Component } from 'react';
// import Konva from 'konva';
import { Image } from 'react-konva';

import Paper from 'material-ui/Paper';

import { connect } from 'react-redux';
import actions from './actions';

const browserStyle = {
  width: 637,
  height: 477,
};

class ImageViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
    };

    this.props.dispatch(actions.setuptImageViewer());
  }

  // previous: willUpdate
  componentWillReceiveProps = (nextProps) => {
    console.log('INSIDE componentWillReceiveProps');
    const image = new window.Image();
    image.src = nextProps.imageURL;
    image.onload = () => {
      this.setState({ image });
    };
  }
  render() {
    return (
      // <Image
      //   image={this.state.image}
      // />
      // <Paper style={browserStyle} zDepth={1} >
      // <Image image={this.state.image} />
      <Image image={this.state.image} />
      // </Paper>
    );
  }
}

const mapStateToProps = state => ({
  imageURL: state.imageController.imageURL,
});

export default connect(mapStateToProps)(ImageViewer);
