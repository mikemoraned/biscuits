import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import ResponsiveCanvas from "./ResponsiveCanvas";
import {CityRenderer} from "./CityRenderer";
import ImageBitmapCreator from "./ImageBitmapCreator";

const PLACE_QUERY = gql`
query PlaceQuery($placeId: String!, $layoutId: String!, $loadSpriteData: Boolean!) {
  place: placeById(id: $placeId) {
    id
    sprite @include(if: $loadSpriteData) {
      dataURL
    }
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
        l: layoutOffset(id: $layoutId) {
          id
          x
          y
        }
      }
    }
  }
}
`;

function expandShortNames(place) {
  const expanded = {
    ...place,
    pieces: place.pieces.map((piece) => (
      {
        ...piece,
        bitmapImage: {
          ...piece.b,
          width: piece.b.w,
          height: piece.b.h,
          spriteOffset: piece.b.s,
          layoutOffset: piece.b.l
        }
      }
    ))
  };
  expanded.pieces.forEach((piece) => {
    if (piece.bitmapImage.layoutOffset == null) {
      console.dir(piece);
    }
  });
  return expanded;
}

class Place extends Component {

  constructor(props) {
    super(props);

    this.state = {
      place: null,
      spriteBitmap: null,
      status: "Loading"
    };
  }

  componentDidMount() {
    const handleError = (error) => {
      console.log(error);
      this.setState({
        status: "Errored"
      });
    };

    const query = (variables) => {
      return this.props.client.query({
        query: PLACE_QUERY,
        variables: {
          placeId: this.props.placeId,
          layoutId: this.props.layout.id,
          ...variables
        }
      });
    };

    query({loadSpriteData: false}).then((result) => {
      this.setState({
        place: expandShortNames(result.data.place),
        status: "Loaded"
      });
      query({loadSpriteData: true}).then((result) => {
        new ImageBitmapCreator()
          .create(this.props.id, result.data.place.sprite.dataURL)
          .then((spriteBitmap) => {
            this.setState({
              spriteBitmap
            });
          });
      }).catch(handleError);
    }).catch(handleError);
  }

  render() {
    return (
      <div className="Place">
        <h1>{ this.props.placeId }, { this.props.layout.name }</h1>
        {this.renderPieces()}
      </div>
    );
  }

  renderPieces() {
    if (this.state.status !== "Loaded") {
      return <div>{this.state.status}</div>;
    }
    else {
      return (
        <ResponsiveCanvas>
          <CityRenderer transitionProportion={this.props.transitionProportion}
                        backgroundColor={'blue'}
                        place={this.state.place}
                        spriteBitmap={this.state.spriteBitmap}/>
        </ResponsiveCanvas>
      );
    }
  }
}

export default withApollo( Place );