import React, { Component } from 'react';
import Measure from 'react-measure';
import ImageBitmapCreator from './ImageBitmapCreator';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

function maxXY(dimensionsList) {
  const first = dimensionsList[0];
  const max = {
    x: first.x + first.width,
    y: first.y + first.height,
  };
  const reducer = (accum, entry) => {
    return {
      x: Math.max(accum.x, entry.x + entry.width),
      y: Math.max(accum.y, entry.y + entry.height),
    }
  };
  return dimensionsList.reduce(reducer, max);
}

function drawBoundingBoxes(bitmapImages, context) {
  bitmapImages.forEach(bitmapImage => {
    context.strokeRect(bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
  });
};

function drawSprites(context, place, spriteBitmap) {
  place.pieces.forEach(piece => {
    const bitmapImage = piece.bitmapImage;
    const spriteOffset = bitmapImage.spriteOffset;
    context.drawImage(spriteBitmap,
      spriteOffset.x, spriteOffset.y, bitmapImage.width, bitmapImage.height,
      bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
  });
};

const Renderer = (bgColor, scaleFn) => {
  return (context, dimensions, place, spriteBitmap) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    const bitmapImages = place.pieces.map(p => p.bitmapImage);
    const max = maxXY(bitmapImages);

    context.strokeStyle = 'black';
    const scale = scaleFn(max, dimensions);

    context.save();
    context.scale(scale, scale);
    drawBoundingBoxes(bitmapImages, context);

    if (spriteBitmap !== null) {
      drawSprites(context, place, spriteBitmap);
    }
    context.restore();

    context.save();
    context.translate(dimensions.width / 2, 0);
    context.scale(scale, scale);
    context.strokeStyle = 'white';
    drawBoundingBoxes(bitmapImages, context);

    context.restore();

    context.fillStyle = 'green';
    context.font = '20px sans-serif';
    context.fillText(`pieces: ${place.pieces.length}`, 10, dimensions.height - 10);
  }
};

const LandscapeRenderer = Renderer('red', (max, dimensions) => dimensions.height / max.y);

const PortraitRenderer = Renderer('blue', (max, dimensions) => dimensions.width / max.x);

class FixedSizeCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      dimensions: this.dimensionsFromContainerDimensions(props.containerDimensions),
      spriteBitmap: null
    });

    this.dimensionsFromContainerDimensions = this.dimensionsFromContainerDimensions.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dimensions: this.dimensionsFromContainerDimensions(nextProps.containerDimensions)
    });
  }

  componentDidMount() {
    this.fetchImages();
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.fetchImages();
    this.updateCanvas();
  }

  fetchImages() {
    if (this.state.spriteBitmap == null) {
      const {id, sprite} = this.props.place;
      if (sprite) {
        console.log("Fetching bitmap for", id);
        new ImageBitmapCreator()
          .create(id, sprite.dataURL)
          .then(bitmap => this.setState({spriteBitmap: bitmap}))
          .then(() => console.log("Fetched bitmap for", id));
      }
    }
  }

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0,0, this.state.dimensions.width, this.state.dimensions.height);
    context.save();
    this.props.rendererFn(context, this.state.dimensions, this.props.place, this.state.spriteBitmap);
    context.restore();
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
      return <FixedSizeCanvas
        containerDimensions={dimensions}
        rendererFn={LandscapeRenderer}
        place={this.props.place}
      />;
    }
    else {
      return <FixedSizeCanvas
        containerDimensions={dimensions}
        rendererFn={PortraitRenderer}
        place={this.props.place}
      />;
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
