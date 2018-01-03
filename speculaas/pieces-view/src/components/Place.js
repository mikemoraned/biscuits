import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ResponsiveCanvas from "./ResponsiveCanvas";

const PLACE_QUERY = gql`
query PlaceQuery($id: String!, $shallowRender: Boolean!) {
  place: placeById(id: $id) {
    id
    sprite @skip(if: $shallowRender) {
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

    return <ResponsiveCanvas place={place}/>;
  }
}

export default graphql(PLACE_QUERY, {
  name: 'placeQuery'
}) ( Place );
