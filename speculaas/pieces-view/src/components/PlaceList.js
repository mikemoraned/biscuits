import React, { Component } from 'react';
import Place from "./Place";

class PlaceList extends Component {

    render() {
        return (
            <div className="PlaceList">
                <ul>
                    {
                        this.props.placeIds.map(placeId => {
                            return <Place key={placeId} id={placeId} />
                        })
                    }
                </ul>
            </div>
        );
    }
}

export default PlaceList;
