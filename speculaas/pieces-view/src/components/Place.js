import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ResponsiveCanvas from "./ResponsiveCanvas";

const PLACE_QUERY = gql`
query PlaceQuery($id: String!) {
  place: placeById(id: $id) {
    id
    sprite {
      dataURL
    }
    pieces {
      id
      bitmapImage {
        x
        y
        width
        height,
        spriteOffset {
          x
          y
        }
      }
    }
  }
}
`;

class Place extends Component {

    render() {
        return (
            <div className="Place">
                <h1>{ this.props.id }</h1>
                {this.renderPieces(this.props.placeQuery)}
            </div>
        );
    }

    renderPieces(placeQuery) {
        if (placeQuery.loading) {
            return <div>Loading</div>
        }

        if (placeQuery.error) {
            return <div>Error</div>
        }

        const place = placeQuery.place;

        return <ResponsiveCanvas place={place}/>;
    }
}

export default graphql(PLACE_QUERY, {
    name: 'placeQuery'
}) ( Place );
