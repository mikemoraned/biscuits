import React, { Component } from 'react';

function maxXY(list, boxFn) {
  const first = boxFn(list[0]);
  const max = {
    x: first.x + first.width,
    y: first.y + first.height,
  };
  const reducer = (accum, entry) => {
    const box = boxFn(entry);
    return {
      x: Math.max(accum.x, box.x + box.width),
      y: Math.max(accum.y, box.y + box.height),
    }
  };
  return list.reduce(reducer, max);
}


export class CityRenderer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      spriteBitmap: null
    };

  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0,0, this.props.dimensions.width, this.props.dimensions.height);
    this.renderBackground(context);

    if (this.props.dimensions.width >= this.props.dimensions.height) {
      this.renderLandscapeLayout(context);
    }
    else {
      this.renderPortraitLayout(context);
    }
  }

  renderPortraitLayout(context) {
    this.renderPiecesInCityPosition(context, {width: 1.0, height: 0.5}, 'black');
    context.translate(0, this.props.dimensions.height / 2);
    this.renderPiecesInPackedPosition(context, {width: 1.0, height: 0.5}, 'white');
  }

  renderLandscapeLayout(context) {
    this.renderPiecesInCityPosition(context, {width: 0.5, height: 1.0}, 'black');
    context.translate(this.props.dimensions.width / 2, 0);
    this.renderPiecesInPackedPosition(context, {width: 0.5, height: 1.0}, 'white');
  }

  renderBackground(context) {
    context.save();
    context.fillStyle = this.props.backgroundColor;
    context.fillRect(0, 0, this.props.dimensions.width, this.props.dimensions.height);
    context.restore();
  }

  renderPiecesInCityPosition(context, scaleProportions, foregroundColor) {
    context.save();

    const bitmapImages = this.props.place.pieces.map(p => p.bitmapImage);
    const max = maxXY(bitmapImages, (bitmapImage) => ({
      x: bitmapImage.x,
      y: bitmapImage.y,
      width: bitmapImage.width,
      height: bitmapImage.height
    }));
    context.save();
    context.scale(
      scaleProportions.width * this.props.dimensions.width / max.x,
      scaleProportions.height * this.props.dimensions.height / max.y
    );
    context.strokeStyle = foregroundColor;
    bitmapImages.forEach(bitmapImage => {
      context.strokeRect(bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
    });

    context.restore();

    context.fillStyle = 'green';
    context.font = '20px sans-serif';
    context.fillText(`foop pieces: ${this.props.place.pieces.length}`, 10, this.props.dimensions.height - 10);

    context.restore();
  }

  renderPiecesInPackedPosition(context, scaleProportions, foregroundColor) {
    context.save();

    const bitmapImages = this.props.place.pieces.map(p => p.bitmapImage);
    const max = maxXY(bitmapImages, (bitmapImage) => ({
      x: bitmapImage.spriteOffset.x,
      y: bitmapImage.spriteOffset.y,
      width: bitmapImage.width,
      height: bitmapImage.height
    }));
    context.save();
    context.scale(
      scaleProportions.width * this.props.dimensions.width / max.x,
      scaleProportions.height * this.props.dimensions.height / max.y
    );
    context.strokeStyle = foregroundColor;
    this.props.place.pieces.forEach(piece => {
      const bitmapImage = piece.bitmapImage;
      const spriteOffset = bitmapImage.spriteOffset;
      context.strokeRect(spriteOffset.x, spriteOffset.y, bitmapImage.width, bitmapImage.height);
    });
    context.restore();

    context.fillStyle = 'green';
    context.font = '20px sans-serif';
    context.fillText(`feep pieces: ${this.props.place.pieces.length}`, 10, this.props.dimensions.height - 10);

    context.restore();
  }

  render() {
    return <canvas ref="canvas" width={this.props.dimensions.width} height={this.props.dimensions.height}/>;
  }
}
