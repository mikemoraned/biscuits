import React, { Component } from 'react';
import Measure from 'react-measure';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

const LandscapeRenderer = (context, dimensions) => {
  context.fillStyle = 'red';
  context.fillRect(0,0, dimensions.width, dimensions.height);
};

const PortraitRenderer = (context, dimensions) => {
  context.fillStyle = 'blue';
  context.fillRect(0,0, dimensions.width, dimensions.height);
};

class FixedSizeCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      dimensions: this.dimensionsFromContainerDimensions(props.containerDimensions)
    });

    this.dimensionsFromContainerDimensions = this.dimensionsFromContainerDimensions.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dimensions: this.dimensionsFromContainerDimensions(nextProps.containerDimensions)
    });
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0,0, this.state.dimensions.width, this.state.dimensions.height);
    this.props.rendererFn(context, this.state.dimensions);
  }

  render() {
    return <canvas ref="canvas" width={this.state.dimensions.width} height={this.state.dimensions.height}/>;
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
}

class ResponsiveCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: LANDSCAPE,
      dimensions: { width: 100, height: 100 },
    };

    this.onResize = this.onResize.bind(this);
    this.canvasForOrientation = this.canvasForOrientation.bind(this);
  }

  onResize(contentRect) {
    const { bounds } = contentRect;

    this.setState({
      orientation: this.orientation(bounds),
      dimensions: bounds
    });
  }

  orientation(dimensions) {
    if (dimensions.width >= dimensions.height) {
      return LANDSCAPE;
    }
    else {
      return PORTRAIT;
    }
  }

  canvasForOrientation(orientation, dimensions) {
    if (orientation === LANDSCAPE) {
      return <FixedSizeCanvas containerDimensions={dimensions} rendererFn={LandscapeRenderer}/>;
    }
    else {
      return <FixedSizeCanvas containerDimensions={dimensions} rendererFn={PortraitRenderer}/>;
    }
  }

  render() {
    const { orientation, dimensions } = this.state;

    return (
      <Measure
        bounds
        onResize={this.onResize}
      >
        {({ measureRef }) => (
          <div className='CanvasContainer' ref={measureRef}>
            { this.canvasForOrientation(orientation, dimensions) }
          </div>
        )}
      </Measure>
    )
  }
}

export default ResponsiveCanvas;
