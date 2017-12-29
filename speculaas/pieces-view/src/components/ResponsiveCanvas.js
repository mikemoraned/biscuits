import React, { Component } from 'react';
import Measure from 'react-measure';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

class ResponsiveCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: LANDSCAPE
    };

    this.onResize = this.onResize.bind(this);
  }

  onResize(contentRect) {
    const { width, height } = contentRect.bounds;

    if (width >= height) {
      this.setState({ orientation: LANDSCAPE});
    }
    else {
      this.setState({ orientation: PORTRAIT});
    }
  }

  render() {
    const { orientation } = this.state;

    return (
      <Measure
        bounds
        onResize={this.onResize}
      >
        {({ measureRef }) => (
          <div className='CanvasContainer' ref={measureRef}>{orientation}</div>
        )}
      </Measure>
    )
  }
}

export default ResponsiveCanvas;
