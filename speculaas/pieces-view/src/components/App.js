import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";
import {TransitionControl} from "./TransitionControl";
import {LayoutSuggest} from "./LayoutSuggest";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      t: 1.0,
      layoutId: 'BNF/GuillotineBafLas/SORT_AREA'
    };

    this.handleTransitionProportionChange = this.handleTransitionProportionChange.bind(this);
    this.handleLayoutChange = this.handleLayoutChange.bind(this);
  }

  handleTransitionProportionChange(t) {
    this.setState({
      t
    });
  }

  handleLayoutChange(layoutId) {
    this.setState({
      layoutId
    });
  }


  render() {
    return (
      <div className="App">
        <TransitionControl className="TransitionControl_top"
                           transitionProportion={this.state.t}
                           onChange={this.handleTransitionProportionChange}/>
        <LayoutSuggest className="LayoutSuggest"
                       layoutId={this.state.layoutId}
                       onChange={this.handleLayoutChange}/>
        {/*<PlaceList transitionProportion={this.state.t}*/}
                   {/*placeIds={['edinburgh', 'jerusalem', 'au', 'newyork', 'budapest']}*/}
                   {/*layoutId={this.state.layoutId}/>*/}
        <PlaceList transitionProportion={this.state.t}
                   // placeIds={['edinburgh', 'au']}
                   placeIds={['edinburgh']}
                   layoutId={this.state.layoutId}/>
        />
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
