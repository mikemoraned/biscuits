import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ResponsiveCanvas from "./ResponsiveCanvas";
import {CityRenderer} from "./CityRenderer";

const PLACE_QUERY = gql`
query PlaceQuery($id: String!) {
  place: placeById(id: $id) {
    id
    pieces {
      id
      b: bitmapImage {
        x
        y
        w: width
        h: height,
        s: spriteOffset {
          x
          y
        }
      }
    }
  }
}
`;

function expandShortNames(place) {
  console.log("expandShortNames");
  return {
    ...place,
    pieces: place.pieces.map((piece) => (
      {
        ...piece,
        bitmapImage: {
          ...piece.b,
          width: piece.b.w,
          height: piece.b.h,
          spriteOffset: piece.b.s
        }
      }
    ))
  };
}

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

    return (
      <ResponsiveCanvas>
        <CityRenderer transitionProportion={this.props.transitionProportion}
                      backgroundColor={'blue'} place={expandShortNames(place)} />
      </ResponsiveCanvas>
    );
  }
}

export default graphql(PLACE_QUERY, {
  name: 'placeQuery'
}) ( Place );
