import React, { Component } from 'react';

export class LayoutSuggest extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(`render, t: ${this.props.transitionProportion}`);
    return <div className={this.props.className}>

    </div>
  }
}
