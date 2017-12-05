import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import actions from './actions';
import { connect } from 'react-redux';
import { Layer, Stage, Rect, Group, Text } from 'react-konva';

class Colormap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.props.dispatch(actions.setupColormap());
  }
  render() {
    const { min, max, stops, colorMapName } = this.props;
    // const newStops = stops.map((value, index) => {
    //   return
    // });
    let total = 0;
    if (stops) {
      total = stops.length;
    }
    const newStops = [];
    for (let i = 0; i < total; i++) {
      newStops.push(i / total, stops[i]);
    }
    return (
      // <div>
      //   Min:{min}
      //   <br />
      //   Max:{max}
      //   <br />
      //   colorName:{colorMapName}
    /* <Stage width={50} height={300}>
          <Layer> */
      <Group>
        <Text
          x={482}
          y={310}
          width={50}
          text={min}
        />
        <Text
          x={482}
          y={0}
          width={50}
          text={max}
        />
        <Text
          x={532}
          y={0}
          width={100}
          text={`Color Name: ${colorMapName}`}
        />
        <Rect
          x={482}
          y={10}
          width={50}
          height={300}
          fillLinearGradientStartPoint={{ x: 0, y: 300 }}
          fillLinearGradientEndPoint={{ x: 0, y: 20 }}
          fillLinearGradientColorStops={newStops}
        />
      </Group>
    /* </Layer>
        </Stage> */
      // </div>
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
