import React, { Component } from 'react';
import Measure from 'react-measure';

class ResponsiveCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dimensions: { width: 100, height: 100 },
    };

    this.onResize = this.onResize.bind(this);
  }

  onResize(contentRect) {
    const { bounds } = contentRect;

    this.setState({
      dimensions: bounds
    });
  }

  dimensionsFromContainerDimensions(containerDimensions) {
    /*
      forcedBorder is required as otherwise we get in a loop with our parent Measure:
      1. We are given our containing size
      2. We go to that size
      3. Parent detects that overall bounding rect has changed, in this case to be larger
      4. Goto 1, where height is larger each time
      => Canvas keeps on getting bigger until it reaches some bound on containing size
     */
    const forcedBorder = 10;
    return this.shrink(this.normalize(containerDimensions), forcedBorder);
  }

  shrink(dimensions, value) {
    return {
      width: dimensions.width - value,
      height: dimensions.height - value
    };
  }

  normalize(dimensions) {
    return {
      width: Math.floor(dimensions.width),
      height: Math.floor(dimensions.height)
    };
  }

  render() {
    const { dimensions } = this.state;

    return (
      <Measure
        bounds
        onResize={this.onResize}
      >
        {({ measureRef }) => (
          <div className='CanvasContainer' ref={measureRef}>
            {React.cloneElement(this.props.children,
              { dimensions: this.dimensionsFromContainerDimensions(dimensions) })}
          </div>
        )}
      </Measure>
    )
  }
}

export default ResponsiveCanvas;
