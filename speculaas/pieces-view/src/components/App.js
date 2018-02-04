import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      t: 0
    };

    this.handleTransitionProportionChange = this.handleTransitionProportionChange.bind(this);
  }

  handleTransitionProportionChange(event) {
    const value = event.target.value;
    this.setState({
      t: (value / 100.0)
    });
    console.log(`Value: ${this.state.t}`);
  }

  render() {
    return (
      <div className="App">
        <input style={{ width: "80%" }}
               type="range" min="0" max="100" step="1"
               value={this.state.t * 100} onChange={this.handleTransitionProportionChange}></input>
        <PlaceList transitionProportion={this.state.t}
                   placeIds={['edinburgh', 'jerusalem', 'au', 'newyork', 'budapest']}/>
        {/*<PlaceList transitionProportion={this.state.t}*/}
                   {/*placeIds={['edinburgh']}/>*/}
        {/*<PlaceList placeIds={['edinburgh']}/>*/}
        {/*<PlaceList placeIds={['edinburgh','budapest']}/>*/}
        {/*<PlaceList placeIds={['jerusalem']}/>*/}
      </div>
    );
  }
}

export default App;
