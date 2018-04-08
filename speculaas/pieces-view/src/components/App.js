import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";
import {TransitionControl} from "./TransitionControl";
import {PlaceChooser} from "./PlaceChooser";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      t: 1.0,
      possiblePlaceIds: ['jerusalem', 'au', 'newyork', 'budapest'],
      placeIds: ['edinburgh']
    };

    this.handleTransitionProportionChange = this.handleTransitionProportionChange.bind(this);
    this.handlePlaceIdAdded = this.handlePlaceIdAdded.bind(this);
  }

  handleTransitionProportionChange(t) {
    this.setState({
      t
    });
  }

  handlePlaceIdAdded(placeId) {
    this.setState({
      placeIds: [ placeId ].concat(this.state.placeIds),
    });
  }

  render() {
    return (
      <div className="App">
        <div className="Control top">
          <TransitionControl className="top"
                             transitionProportion={this.state.t}
                             onChange={this.handleTransitionProportionChange}/>
          <PlaceChooser className="top"
                        allowedPlaceIds={this.state.possiblePlaceIds}
                        onPlaceIdAdded={this.handlePlaceIdAdded}/>
        </div>
        <PlaceList transitionProportion={this.state.t}
                   placeIds={this.state.placeIds}/>
        <TransitionControl className="bottom"
                           transitionProportion={this.state.t}
                           onChange={this.handleTransitionProportionChange}/>
      </div>
    );
  }
}

export default App;
