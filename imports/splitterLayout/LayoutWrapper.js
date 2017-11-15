import React, { Component } from 'react';
import SplitterLayout from '../splitterLayout/components/SplitterLayout';

const splitterWidth = 4;

class LayoutWrapper extends Component {
  constructor(props) {
    super(props);

    this.firstContainerSize = {};
    this.secondaryPercentage = 0;
    // if (this.props.firstPercentage) {
    //   // same as secondColumnPercentange
    //   this.secondaryPercentage = 100 - this.props.firstPercentage;
    // }

    this.subLevelSecondaryPercentage = 0;
    if (this.props.firstPercentage && this.props.secondPercentage) {
      // same as thirdColumnPercentange*100
      this.subLevelSecondaryPercentage =
      100 * ((100 - this.props.firstPercentage - this.props.secondPercentage)
      / (100 - this.props.firstPercentage));
    }

    this.firstColumnSize = {};
    this.secondColumnSize = {};
    this.thirdColumnSize = {};
  }

  // secondaryPaneSize is this.secondaryPercentage
  setupNewSize = () => {
    this.firstColumnSize.height = this.firstContainerSize.height;
    const secondBlockWidth =
    this.firstContainerSize.width * (this.secondaryPercentage / 100);
    // containerWidth - splitterWidth - this.firstColumnSize.width;
    this.firstColumnSize.width =
    this.firstContainerSize.width - secondBlockWidth - splitterWidth;
    // (containerWidth - splitterWidth) * this.firstPercentage / 100;

    // 這裡用記的的 !!!!!!!!!!!!!!!!!!!!!!!
    // const thirdColumnPercentange = (100 - this.firstPercentage - this.secondPercentage) /
    // (100 - this.firstPercentage);
    this.thirdColumnSize.width = (secondBlockWidth) * (this.subLevelSecondaryPercentage / 100);
    this.thirdColumnSize.height = this.firstContainerSize.height;

    this.secondColumnSize.width = secondBlockWidth - splitterWidth - this.thirdColumnSize.width;
    this.secondColumnSize.height = this.firstContainerSize.height;
    this.props.onUpdate(this.secondColumnSize.width);
    console.log('1st:', this.firstColumnSize.width);
    console.log('2nd:', this.secondColumnSize.width);
    console.log('3rd:', this.thirdColumnSize.width);
  }

  // affect 1, 2, 3 column
  resize1stLevel = (containerWidth, containerHeight, secondaryPaneSize) => {
    console.log('resize1stLevel:', containerWidth, ';height:', containerHeight, ';size:', secondaryPaneSize);

    this.secondaryPercentage = secondaryPaneSize;
    this.firstContainerSize.width = containerWidth;
    this.firstContainerSize.height = containerHeight;
    this.setupNewSize();
    // console.log('resize1stLevel:', width, ';height:', height, ';size:', secondaryPaneSize);

    // TODO callback
    if (this.props.resizeHandler) {
      this.props.resizeHandler(this.firstColumnSize, this.secondColumnSize, this.thirdColumnSize);
    }
  };
  // affect 2,3 column, current Container is not the 1st level SplitterLayout !!!
  drage2ndSplitterHandler = (containerWidth, containerHeight, secondaryPaneSize) => {
    console.log('drage2nd:', containerWidth, ';height:', containerHeight, ';size:', secondaryPaneSize);
    this.subLevelSecondaryPercentage = secondaryPaneSize;
    this.setupNewSize();

    // TODO callback
    if (this.props.drage2ndeHandler) {
      this.props.drage2ndeHandler(this.firstColumnSize,
        this.secondColumnSize, this.thirdColumnSize);
    }
  };
  // affect 1,2, 3 column
  drage1stSplitterHandler = (containerWidth, containerHeight, secondaryPaneSize) => {
    console.log('drage1st:', containerWidth, ';height:', containerHeight, ';size:', secondaryPaneSize);

    this.secondaryPercentage = secondaryPaneSize;
    this.setupNewSize();

    // TODO callback
    if (this.props.drage1stHandler) {
      this.props.drage1stHandler(this.firstColumnSize, this.secondColumnSize, this.thirdColumnSize);
    }
  };

  // affect 1, 2, 3 column
  mount1stLevel = (containerWidth, containerHeight, secondaryPaneSize) => {
    console.log('mount1stLevel:', containerWidth, ';height:', containerHeight, ';size:', secondaryPaneSize);

    this.secondaryPercentage = secondaryPaneSize;
    this.firstContainerSize.width = containerWidth;
    this.firstContainerSize.height = containerHeight;
    this.setupNewSize();

    // console.log('sec:', containerWidth * (secondaryPaneSize / 100));

    // TODO callback
    if (this.props.mountHandler) {
      this.props.mountHandler(this.firstColumnSize, this.secondColumnSize, this.thirdColumnSize);
    }
  };

  // mount2ndLevel = () => {
  //   console.log('mount2ndLevel');
  //   console.log(arguments);
  // };

  render() {
    // console.log('in render');
    const children = React.Children.toArray(this.props.children).slice(0, 3);
    let secondColumnPercentange = 0;
    let thirdColumnPercentange = 0;

    if (this.props.firstPercentage) {
      secondColumnPercentange = 100 - this.props.firstPercentage;
    }

    let firstChild = null;
    let secondChild = null;
    let thirdCihld = null;

    if (children.length > 0) {
      firstChild = children[0];

      if (children.length > 1) {
        // 2 or 3
        secondChild = children[1];
        // console.log('grimmer assign 2nd');

        if (children.length > 2) {
          // 3 columns
          thirdCihld = children[2];
          // console.log('grimmer assign 3rd');
        } else {
          // only 2 columns: special case
          if (this.props.firstPercentage && this.props.secondPercentage) {
            secondColumnPercentange =
            100 * (this.props.secondPercentage /
              (this.props.firstPercentage + this.props.secondPercentage));
          }
        }
      }
    }

    // !!! there may be some error due to the width of splitter !!
    // 508.8: 508.8: 256.4=(2nd block*0.33), so at leate flex+33% is real_with/total_width;
    // flex+percentage is only setupt for secondaryPane. Primary uses its remaining, flex: 1 1 auto;
    // flex seems not affect real width. style.widith does.
    // use this.subLevelSecondaryPercentage instead of the below
    if (this.props.firstPercentage && this.props.secondPercentage) {
      thirdColumnPercentange = 100 *
      ((100 - this.props.firstPercentage - this.props.secondPercentage) /
      (100 - this.props.firstPercentage));
    }

    // 0個, 就空的
    // 1個, 就1個
    // 2個, 就2個
    // const firstPercentage = this.props.firstPercentage;

    // let secondLevelContent =  null;
    // if (secondChild && thirdCihld ) {
    //   secondLevelContent = (secondChild}{thirdCihld)
    // }

    let secondContent = null;
    if (secondColumnPercentange && thirdColumnPercentange) {
      // console.log('grimmer 1 - use 3rd percentage');
      secondContent = ({ thirdCihld } ? (<SplitterLayout
        percentage
        resizeHandler={this.resize2ndLevel}
        drageHandler={this.drage2ndSplitterHandler}
        secondaryInitialSize={thirdColumnPercentange}
      >{secondChild}{thirdCihld}
      </SplitterLayout>)
        : { secondChild });
    } else {
      // console.log('grimmer 2');
      secondContent = ({ thirdCihld } ? (<SplitterLayout
        percentage
      >{secondChild}{thirdCihld}</SplitterLayout>) : { secondChild });
    }

    // console.log('grimmer 2nd percentage,', secondColumnPercentange);
    // console.log('grimmer 3rd percentage,', thirdColumnPercentange);


    return (
      <div>
        {
          secondColumnPercentange ?
            (<SplitterLayout
              percentage
              secondaryInitialSize={secondColumnPercentange}
              mountHandler={this.mount1stLevel}
              resizeHandler={this.resize1stLevel}
              drageHandler={this.drage1stSplitterHandler}
            >
              {firstChild}
              {secondContent}
            </SplitterLayout>) :
            (<SplitterLayout percentage>
              {firstChild}
              {secondContent}
            </SplitterLayout>)
        }
        {/* <SplitterLayout percentage secondaryInitialSize={60}>
          <div>Pane 1</div>
          {/* <SplitterLayout percentage secondaryInitialSize={33}>
            <div>Pane 2:66</div>
            <div>Pane 3:33</div>
          </SplitterLayout> */}
      </div>
    );
  }
}

export default LayoutWrapper;
