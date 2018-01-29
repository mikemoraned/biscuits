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

  constructor(props) {
    super(props);

    this.prevLoaded = false;
  }

  componentDidUpdate(prevProps) {
    if (!this.prevLoaded) {
      const loaded = !(prevProps.placeQuery.loading || prevProps.placeQuery.error);
      if (loaded) {
        this.prevLoaded = loaded;
        this.props.onLoad();
      }
    }
  }

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
        <CityRenderer backgroundColor={'blue'} place={expandShortNames(place)} />
      </ResponsiveCanvas>
    );
  }
}

export default graphql(PLACE_QUERY, {
  name: 'placeQuery'
}) ( Place );
