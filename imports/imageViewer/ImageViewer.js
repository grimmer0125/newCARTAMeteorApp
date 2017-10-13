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
let image = null;
class ImageViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
    };
    this.props.dispatch(actions.setuptImageViewer());
  }
  componentWillReceiveProps = (nextProps) => {
    // console.log('INSIDE componentWillUpdate');
    image = new window.Image();
    image.src = `data:image/jpeg;base64,${nextProps.imageURL}`;
    image.onload = () => {
      // console.log('IMAGE ONLOAD');
      this.setState({ image });
    };
  }
  // componentDidMount = () => {
  //   // console.log('INSIDE componentWillUpdate');
  //   image = new window.Image();
  //   image.src = '/images/carta.png';
  //   image.onload = () => {
  //     // console.log('IMAGE ONLOAD');
  //     this.setState({ image });
  //   };
  // }
  render() {
    return (
      // <Image
      //   image={this.state.image}
      // />
      // <Paper style={browserStyle} zDepth={1} >
      // <Image image={this.state.image} />
      // <div>
      <Image
        width={637}
        height={477}
        image={this.state.image}
        // ref={(node) => {
        //   this.image = node;
        //   if (this.image) {
        //     this.image.moveToTop();
        //   }
        // }}
        // opacity={0.5}
      />
      // </div>
      // </Paper>
    );
  }
}

const mapStateToProps = state => ({
  imageURL: state.imageController.imageURL,
});

export default connect(mapStateToProps)(ImageViewer);
