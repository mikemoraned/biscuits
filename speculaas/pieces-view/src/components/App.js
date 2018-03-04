import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";

class TransitionControl extends Component {
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

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      t: 0.5
    };

    this.handleTransitionProportionChange = this.handleTransitionProportionChange.bind(this);
  }

  handleTransitionProportionChange(t) {
    this.setState({
      t
    });
  }

  render() {
    return (
      <div className="App">
        <TransitionControl className="TransitionControl_top"
                           transitionProportion={this.state.t}
                           onChange={this.handleTransitionProportionChange}/>
        <PlaceList transitionProportion={this.state.t}
                   placeIds={['edinburgh', 'jerusalem', 'au', 'newyork', 'budapest']}/>
        {/*<PlaceList transitionProportion={this.state.t}*/}
                   {/*placeIds={['newyork']}/>*/}
        {/*<PlaceList transitionProportion={this.state.t}*/}
                   {/*placeIds={['edinburgh']}/>*/}
        {/*<PlaceList placeIds={['edinburgh']}/>*/}
        {/*<PlaceList placeIds={['edinburgh','budapest']}/>*/}
        {/*<PlaceList placeIds={['jerusalem']}/>*/}
        <TransitionControl className="TransitionControl_bottom"
                           transitionProportion={this.state.t}
                           onChange={this.handleTransitionProportionChange}/>
      </div>
    );
  }
}

export default App;
