import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const ALL_PIECES_QUERY = gql`
  query AllPiecesQuery($id: String!) {
    pieces: piecesByPlaceId(id: $id) {
      id
    }
  }
`;

class Place extends Component {

    render() {
        return (
            <div className="Place">
                <h1>{ this.props.id }</h1>
                { this.renderPieces(this.props.allPiecesQuery) }
            </div>
        );
    }

    renderPieces(allPiecesQuery) {
        if (allPiecesQuery.loading) {
            return <div>Loading</div>
        }

        if (allPiecesQuery.error) {
            return <div>Error</div>
        }

        const pieces = allPiecesQuery.pieces;

        return <div>
            { pieces.map(piece => (
                <span key={piece.id}>{ piece.id } </span>
            ))}
        </div>;
    }
}

export default graphql(ALL_PIECES_QUERY, {
    name: 'allPiecesQuery'
}) ( Place );
