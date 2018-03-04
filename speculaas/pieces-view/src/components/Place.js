import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import ResponsiveCanvas from "./ResponsiveCanvas";
import {CityRenderer} from "./CityRenderer";
import ImageBitmapCreator from "./ImageBitmapCreator";

const PLACE_QUERY = gql`
query PlaceQuery($id: String!, $loadSpriteData: Boolean!, $selectedLayoutId: String!) {
  place: placeById(id: $id) {
    id
    sprite @include(if: $loadSpriteData) {
      dataURL
    }
    layouts {
      id
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
        l: layoutOffset(id: $selectedLayoutId) {
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
          spriteOffset: piece.b.s,
          layoutOffset: piece.b.l
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
      selectedLayoutId: "sprite",
      spriteBitmap: null,
      status: "Loading"
    };

    this.handleSelectedLayoutChange = this.handleSelectedLayoutChange.bind(this);
  }

  componentDidMount() {
    this.fetch(this.state.selectedLayoutId);
  }

  handleFetchError(error) {
    console.log(error);
    this.setState({
      status: "Errored"
    });
  }

  query(variables) {
    return this.props.client.query({
      query: PLACE_QUERY,
      variables: {
        id: this.props.id,
        selectedLayoutId: this.state.selectedLayoutId,
        ...variables
      }
    });
  }

  fetch(layoutId) {
    this.setState({
      status: "Loading"
    });

    this.query({loadSpriteData: false, selectedLayoutId: layoutId}).then((result) => {
      this.setState({
        place: expandShortNames(result.data.place),
        status: "Loaded"
      });
      this.query({loadSpriteData: true, selectedLayoutId: layoutId}).then((result) => {
        new ImageBitmapCreator()
          .create(this.props.id, result.data.place.sprite.dataURL)
          .then((spriteBitmap) => {
            this.setState({
              spriteBitmap
            });
          });
      }).catch(this.handleFetchError);
    }).catch(this.handleFetchError);
  }

  handleSelectedLayoutChange(event) {
    const id = event.target.value;
    this.setState({
      selectedLayoutId: id
    });
    this.fetch(id);
  }

  render() {
    return (
      <div className="Place">
        <h1>{ this.props.id }</h1>
        {this.renderLayoutChoice()}
        {this.renderPieces()}
      </div>
    );
  }

  renderLayoutChoice() {
    if (this.state.status !== "Loaded") {
      return <div></div>;
    }
    else {
      return (
        <select value={this.state.selectedLayoutId} onChange={this.handleSelectedLayoutChange}>
          { this.state.place.layouts.map((layout) => (
            <option key={layout.id} value={layout.id}>{layout.id} Layout</option>
          ))}
        </select>
      );
    }
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