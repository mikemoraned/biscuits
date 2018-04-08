import React, { Component } from 'react';
import { interpolateRgb } from 'd3-interpolate';
import VisibilitySensor from 'react-visibility-sensor';

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

    this.backgroundColorInterpolator = interpolateRgb('red', props.backgroundColor);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  onVisibilityChange(isVisible) {
    this.setState({
      visible: isVisible
    });
  }

  backgroundColor() {
    return this.backgroundColorInterpolator(this.props.transitionProportion);
  }

  componentDidMount() {
    this.doInAnimationFrame(() => {
      this.updateCanvas();
    });
  }

  componentDidUpdate() {
    this.doInAnimationFrame(() => {
      this.updateCanvas();
    });
  }

  doInAnimationFrame(fn) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(fn);
    }
    else {
      fn();
    }
  }

  saveRestore(context, fn) {
    context.save();
    fn(context);
    context.restore();
  }

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    this.saveRestore(context, (context) => {
      context.clearRect(0,0, this.props.dimensions.width, this.props.dimensions.height);
      this.renderBackground(context);

      if (this.state.visible) {
        if (this.props.dimensions.width >= this.props.dimensions.height) {
          this.renderLandscapeLayout(context);
        }
        else {
          this.renderPortraitLayout(context);
        }
      }
    });
  }

  renderPortraitLayout(context) {
    this.saveRestore(context, (context) => {
      this.renderPiecesInCityPosition(context, {width: 1.0, height: 0.5}, 'black');
      context.translate(0, this.props.dimensions.height / 2);
      this.renderPiecesInTransitionedPosition(context, {width: 1.0, height: 0.5}, 'white');
    });
  }

  renderLandscapeLayout(context) {
    this.saveRestore(context, (context) => {
      this.renderPiecesInCityPosition(context, {width: 0.5, height: 1.0}, 'black');
      context.translate(this.props.dimensions.width / 2, 0);
      this.renderPiecesInTransitionedPosition(context, {width: 0.5, height: 1.0}, 'white');
    });
  }

  renderBackground(context) {
    this.saveRestore(context, (context) => {
      context.fillStyle = this.backgroundColor();
      context.fillRect(0, 0, this.props.dimensions.width, this.props.dimensions.height);
    });
  }

  renderPiecesInCityPosition(context, scaleProportions, foregroundColor) {
    this.saveRestore(context, (context) => {
      const bitmapImages = this.props.place.pieces.map(p => p.bitmapImage);
      const max = maxXY(bitmapImages, (bitmapImage) => ({
        x: bitmapImage.x,
        y: bitmapImage.y,
        width: bitmapImage.width,
        height: bitmapImage.height
      }));
      this.saveRestore(context, (context) => {
        context.scale(
          scaleProportions.width * this.props.dimensions.width / max.x,
          scaleProportions.height * this.props.dimensions.height / max.y
        );
        context.strokeStyle = foregroundColor;

        if (this.props.spriteBitmap !== null) {
          this.props.place.pieces.forEach(piece => {
            const bitmapImage = piece.bitmapImage;
            const spriteOffset = bitmapImage.spriteOffset;
            context.drawImage(this.props.spriteBitmap,
              spriteOffset.x, spriteOffset.y, bitmapImage.width, bitmapImage.height,
              bitmapImage.x, bitmapImage.y, bitmapImage.width, bitmapImage.height);
          });
        }
      });

      context.fillStyle = 'green';
      context.font = '20px sans-serif';
      context.fillText(`foop pieces: ${this.props.place.pieces.length}`, 10, this.props.dimensions.height - 10);
    });
  }

  renderPiecesInTransitionedPosition(context, scaleProportions, foregroundColor) {
    this.saveRestore(context, (context) => {
      const bitmapImages = this.props.place.pieces.map(p => p.bitmapImage);
      const bitmapImageMax = maxXY(bitmapImages, (bitmapImage) => ({
        x: bitmapImage.x,
        y: bitmapImage.y,
        width: bitmapImage.width,
        height: bitmapImage.height
      }));
      const layoutOffsetMax = maxXY(bitmapImages, (bitmapImage) => {
        // console.dir(bitmapImage);
        return {
          x: bitmapImage.layoutOffset.x,
          y: bitmapImage.layoutOffset.y,
          width: bitmapImage.width,
          height: bitmapImage.height
        }
      });
      this.saveRestore(context, (context) => {
        context.strokeStyle = foregroundColor;
        context.lineWidth = 0.01 + ((2.0 - 0.01) * Math.sin(this.props.transitionProportion * Math.PI));
        const bT = (1.0 - this.props.transitionProportion);
        const lT = this.props.transitionProportion;
        context.scale(
          scaleProportions.width
          * ((bT * (this.props.dimensions.width / bitmapImageMax.x))
             + (lT * (this.props.dimensions.width / layoutOffsetMax.x))),

          scaleProportions.height
          * ((bT * (this.props.dimensions.height / bitmapImageMax.y))
             + (lT * (this.props.dimensions.height / layoutOffsetMax.y))),
        );
        this.props.place.pieces.forEach(piece => {
        // const foop = [ this.props.place.pieces[0] ];
        // foop.forEach(piece => {
        //   console.dir(piece);
          const bitmapImage = piece.bitmapImage;
          const layoutOffset = bitmapImage.layoutOffset;

          const x = (bT * bitmapImage.x) + (lT * layoutOffset.x);
          const y = (bT * bitmapImage.y) + (lT * layoutOffset.y);

          if (this.props.spriteBitmap !== null) {
            const bitmapImage = piece.bitmapImage;
            const spriteOffset = bitmapImage.spriteOffset;
            context.drawImage(this.props.spriteBitmap,
              spriteOffset.x, spriteOffset.y, bitmapImage.width, bitmapImage.height,
              x, y, bitmapImage.width, bitmapImage.height);
          }

          context.strokeRect(x, y, bitmapImage.width, bitmapImage.height);
        });
      });

      context.fillStyle = 'green';
      context.font = '20px sans-serif';
      context.fillText(`feep pieces: ${this.props.place.pieces.length}, t: ${this.props.transitionProportion}`,
        10, this.props.dimensions.height - 10);
    });
  }

  render() {
    return (
      <VisibilitySensor onChange={this.onVisibilityChange} partialVisibility={true} scrollCheck={true}>
        <canvas ref="canvas" width={this.props.dimensions.width} height={this.props.dimensions.height}/>
      </VisibilitySensor>
    );
  }
}
