import React, { Component } from 'react';
import Place from "./Place";

class PlaceList extends Component {

    constructor(props) {
      super(props);

      this.state = {
        needingLoaded: this.props.placeIds.length,
        loaded: 0
      };

      this.onPlaceLoad = this.onPlaceLoad.bind(this);
      this.shouldShallowRender = this.shouldShallowRender.bind(this);
    }

    onPlaceLoad() {
      this.setState({
        loaded: this.state.loaded + 1
      });
    }

    shouldShallowRender() {
      return this.state.loaded >= this.state.needingLoaded;
    }

    render() {
      return (
        <div className="PlaceList">
          {
            this.props.placeIds.map(placeId => {
              return <Place key={placeId} id={placeId} transitionProportion={this.props.transitionProportion}
                            shallowRender={this.shouldShallowRender()} onLoad={this.onPlaceLoad}/>
            })
          }
        </div>
      );
    }
}

export default PlaceList;
