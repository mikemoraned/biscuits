import React, { Component } from 'react';

export class FlatColorRenderer extends Component {

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0,0, this.props.dimensions.width, this.props.dimensions.height);
    context.save();
    context.fillStyle = this.props.color;
    context.fillRect(0, 0, this.props.dimensions.width, this.props.dimensions.height);
    context.restore();
  }

  render() {
    return <canvas ref="canvas" width={this.props.dimensions.width} height={this.props.dimensions.height}/>;
  }
}
