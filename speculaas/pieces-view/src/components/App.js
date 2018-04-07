import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";
import {TransitionControl} from "./TransitionControl";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      t: 1.0
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
          {/*placeIds={['edinburgh', 'au']}/>*/}
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
