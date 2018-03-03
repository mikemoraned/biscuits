import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
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

  constructor(props) {
    super(props);

    this.state = {
      place: null,
      status: "Loading"
    };
  }

  componentDidMount() {
    this.props.client.query({
      query: PLACE_QUERY,
      variables: {
        id: this.props.id
      }
    }).then((result) => {
      this.setState({
        place: expandShortNames(result.data.place),
        status: "Loaded"
      });
    }).catch((error) => {
      console.log(error);
      this.setState({
        status: "Errored"
      });
    });
  }

  render() {
    return (
      <div className="Place">
        <h1>{ this.props.id }</h1>
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
                        backgroundColor={'blue'} place={this.state.place} />
        </ResponsiveCanvas>
      );
    }
  }
}

export default withApollo( Place );