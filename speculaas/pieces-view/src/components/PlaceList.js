import React, { Component } from 'react';
import Place from "./Place";

class PlaceList extends Component {

    render() {
      return (
        <div className="PlaceList">
          {
            this.props.placeIds.map(placeId => {
              return <Place key={placeId} id={placeId} transitionProportion={this.props.transitionProportion} />
            })
          }
        </div>
      );
    }
}

export default PlaceList;
