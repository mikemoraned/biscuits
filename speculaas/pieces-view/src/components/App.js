import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";
import {TransitionControl} from "./TransitionControl";
import {PlaceChooser} from "./PlaceChooser";

class App extends Component {

  constructor(props) {
    super(props);

    const possiblePlaceIds =  ['edinburgh', 'jerusalem', 'au', 'newyork', 'budapest'];
    const possibleLayouts = [
      {
        id: 'BNF/GuillotineBafLas/SORT_AREA',
        name: 'Guillotine',
      },
      {
        id: 'BNF/MaxRectsBaf/SORT_AREA',
        name: 'MaxRectsBaf'
      }
    ];

    const possibleChoices = possiblePlaceIds.reduce((accum, placeId) => {
      possibleLayouts.forEach(layout => {
        const choice = {
          placeId,
          layout
        };
        const choiceId = this.choiceIdForChoice(choice);
        accum[choiceId] = choice;
      });
      return accum;
    }, {});

    this.state = {
      t: 1.0,
      possibleChoices,
      chosenIds: [ 'edinburgh_BNF/GuillotineBafLas/SORT_AREA' ]
    };

    this.handleTransitionProportionChange = this.handleTransitionProportionChange.bind(this);
    this.handleChosen = this.handleChosen.bind(this);
  }

  choiceIdForChoice(choice) {
    return `${choice.placeId}_${choice.layout.id}`;
  }

  handleTransitionProportionChange(t) {
    this.setState({
      t
    });
  }

  handleChosen(choiceId) {
    this.setState({
      chosenIds: [ choiceId ].concat(this.state.chosenIds),
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
                        possibleChoices={this.state.possibleChoices}
                        chosenIds={this.state.chosenIds}
                        onChosen={this.handleChosen}/>
        </div>
        <PlaceList transitionProportion={this.state.t}
                   possibleChoices={this.state.possibleChoices}
                   chosenIds={this.state.chosenIds}/>
        <TransitionControl className="bottom"
                           transitionProportion={this.state.t}
                           onChange={this.handleTransitionProportionChange}/>
      </div>
    );
  }
}

export default App;
