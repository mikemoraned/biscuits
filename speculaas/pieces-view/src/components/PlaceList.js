import React, { Component } from 'react';
import Place from "./Place";

class PlaceList extends Component {

    render() {
      return (
        <div className="PlaceList">
          {
            this.props.chosenIds.map(chosenId => {
              const choice = this.props.possibleChoices[chosenId];
              return <Place key={chosenId}
                            placeId={choice.placeId}
                            layout={choice.layout}
                            transitionProportion={this.props.transitionProportion} />
            })
          }
        </div>
      );
    }
}

export default PlaceList;
