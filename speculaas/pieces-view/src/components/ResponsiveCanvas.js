import React, { Component } from 'react';
import Measure from 'react-measure';
import ImageBitmapCreator from './ImageBitmapCreator';
import {LANDSCAPE, orientation} from "./Orientation";

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

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0,0, this.state.dimensions.width, this.state.dimensions.height);
    context.save();
    this.renderCanvas(context, this.state.dimensions);
    context.restore();
  }

  renderCanvas(context, dimensions) {

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

class PlaceStretchRenderer extends FixedSizeCanvas {
  constructor(props) {
    super(props);

    this.state = {
      spriteBitmap: null
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.fetchImages();
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    this.fetchImages();
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

  backgroundColor() {
    if (orientation(this.props.dimensions) === LANDSCAPE) {
      return 'red';
    }
    else {
      return 'blue';
    }
  }

  renderCanvas(context, dimensions) {
    context.fillStyle = this.backgroundColor();
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    const bitmapImages = this.props.place.pieces.map(p => p.bitmapImage);
    const max = maxXY(bitmapImages);
    context.save();
    context.scale(
      dimensions.width / max.x,
      dimensions.height / max.y
    );
    context.strokeStyle = 'black';
    bitmapImages.forEach(bitmapImage => {
      context.strokeRect(bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
    });

    if (this.state.spriteBitmap !== null) {
      this.props.place.pieces.forEach(piece => {
        const bitmapImage = piece.bitmapImage;
        const spriteOffset = bitmapImage.spriteOffset;
        context.drawImage(this.state.spriteBitmap,
          spriteOffset.x, spriteOffset.y, bitmapImage.width, bitmapImage.height,
          bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
      });
    }
    context.restore();

    context.fillStyle = 'green';
    context.font = '20px sans-serif';
    context.fillText(`pieces: ${this.props.place.pieces.length}`, 10, dimensions.height - 10);
  }
};


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

  render() {
    const { dimensions } = this.state;

    return (
      <Measure
        bounds
        onResize={this.onResize}
      >
        {({ measureRef }) => (
          <div className='CanvasContainer' ref={measureRef}>
            <PlaceStretchRenderer
              containerDimensions={dimensions}
              place={this.props.place}
            />
          </div>
        )}
      </Measure>
    )
  }
}

export default ResponsiveCanvas;
