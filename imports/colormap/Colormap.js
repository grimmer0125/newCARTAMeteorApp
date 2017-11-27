import React, { Component } from 'react';
import actions from './actions';
import { connect } from 'react-redux';
import { Layer, Stage, Rect } from 'react-konva';

class Colormap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.props.dispatch(actions.setupColormap());
  }

  render() {
    const { min, max, stops, colorMapName } = this.props;
    const total = 0;
    if (stops) {
      total = stops.length;
    }

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
        <br />
        colorName:{colorMapName}
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
  const { min, max, stops, colorMapName } = ColormapDB;
  return {
    min,
    max,
    stops,
    colorMapName,
  };
};

export default connect(mapStateToProps)(Colormap);
