import React, { Component } from 'react';
import actions from './actions';
import { connect } from 'react-redux';
import { Layer, Stage, Rect } from 'react-konva';

class Colormap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { min, max, stops } = this.props;
    const total = stops.length;
    const newStops = [];
    for (let i = 0; i < total; i++) {
      newStops.push(i / total, stops[i]);
    }
    // const newStops = stops.map((value, index) => {
    //   return
    // });
    return (
      <div>
        Min:{min}
        <br />
        Max:{max}
        <Stage width={300} height={50}>
          <Layer >
            <Rect
              width={300}
              height={50}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 300, y: 0 }}
              fillLinearGradientColorStops={newStops}
            />
          </Layer>
        </Stage>

      </div>
    );
  }
}


const mapStateToProps = (state) => {
  const { ColormapDB } = state;
  const { min, max, stops } = ColormapDB;
  return {
    min,
    max,
    stops,
  };
};

export default connect(mapStateToProps)(Colormap);
