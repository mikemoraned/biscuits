import React, { Component } from 'react';

export class PlaceChooser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      remainingPlaceIds: this.props.allowedPlaceIds,
      nextPlaceId: this.props.allowedPlaceIds[0],
      hasNextPlaceId: true
    };

    this.handleNextPlaceIdChange = this.handleNextPlaceIdChange.bind(this);
    this.addNextPlaceId = this.addNextPlaceId.bind(this);
  }

  handleNextPlaceIdChange(event) {
    this.setState({
      nextPlaceId: event.target.value
    });
  }

  addNextPlaceId() {
    this.props.onPlaceIdAdded(this.state.nextPlaceId);

    const remainingPlaceIds = this.state.remainingPlaceIds.filter(placeId => placeId !== this.state.nextPlaceId);
    const hasNextPlaceId = remainingPlaceIds.length > 0;

    this.setState({
      remainingPlaceIds,
      nextPlaceId: hasNextPlaceId ? remainingPlaceIds[0] : '',
      hasNextPlaceId
    });
  }

  render() {
    return <div className={`PlaceChooser ${this.props.className}`}>
      <select value={this.state.nextPlaceId}
              onChange={this.handleNextPlaceIdChange}
              disabled={!this.state.hasNextPlaceId}>
        {this.state.remainingPlaceIds.map(placeId => (
          <option value={placeId} key={placeId}>{placeId}</option>
        ))}
      </select>
      <button onClick={this.addNextPlaceId} disabled={!this.state.hasNextPlaceId}>Add</button>
    </div>
  }
}
