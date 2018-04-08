import React, { Component } from 'react';
import '../styles/TransitionControl.css';

export class TransitionControl extends Component {
  constructor(props) {
    super(props);

    this.onValueChange = this.onValueChange.bind(this);
  }

  onValueChange(event) {
    const value = event.target.value;
    this.props.onChange(value / 100.0);
  }

  render() {
    return <div className={`TransitionControl ${this.props.className}`}>
      <input style={{width: "100%"}}
             type="range" min="0" max="100" step="1"
             value={this.props.transitionProportion * 100}
             onChange={this.onValueChange}></input>
    </div>
  }
}

