import React, { Component } from 'react';

export class TransitionControl extends Component {
  constructor(props) {
    super(props);

    this.onValueChange = this.onValueChange.bind(this);

    console.log(`constructor, : ${this.props.transitionProportion}`);
  }

  onValueChange(event) {
    const value = event.target.value;
    console.log(`onChange, value: ${value}`);
    this.props.onChange(value / 100.0);
  }

  render() {
    console.log(`render, t: ${this.props.transitionProportion}`);
    return <div className={this.props.className}>
      <input style={{width: "100%"}}
             type="range" min="0" max="100" step="1"
             value={this.props.transitionProportion * 100}
             onChange={this.onValueChange}></input>
    </div>
  }
}
