import React, { Component } from 'react';

export class PlaceChooser extends Component {
  constructor(props) {
    super(props);

    const remainingChoiceIds = this.findRemainingChoiceIds(props);
    this.state = {
      choiceIds: remainingChoiceIds,
      nextChoiceId: remainingChoiceIds[0],
      hasRemainingChoiceIds: true,
    };

    this.handleNextChoiceIdChange = this.handleNextChoiceIdChange.bind(this);
    this.addNextChoiceId = this.addNextChoiceId.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const remainingChoiceIds = this.findRemainingChoiceIds(nextProps);
    const hasRemainingChoiceIds = remainingChoiceIds.length > 0;
    this.setState({
      choiceIds: remainingChoiceIds,
      nextChoiceId: hasRemainingChoiceIds ? remainingChoiceIds[0] : null,
      hasRemainingChoiceIds
    });
  }

  findRemainingChoiceIds(props) {
    return Object.keys(props.possibleChoices).filter(choiceId => {
      return props.chosenIds.indexOf(choiceId) === -1
    });
  }

  handleNextChoiceIdChange(event) {
    this.setState({
      nextChoiceId: event.target.value
    });
  }

  addNextChoiceId() {
    const chosenId = this.state.nextChoiceId;
    this.props.onChosen(chosenId);
  }

  render() {
    const disabled = !this.state.hasRemainingChoiceIds;
    return <div className={`PlaceChooser ${this.props.className}`}>
      <select value={this.state.nextChoiceId}
              onChange={this.handleNextChoiceIdChange}
              disabled={disabled}>
        {this.state.choiceIds.map(choiceId => {
          const choice = this.props.possibleChoices[choiceId];
          return <option value={choiceId} key={choiceId}>{choice.placeId} {choice.layout.name}</option>
        })}
      </select>
      <button onClick={this.addNextChoiceId} disabled={disabled}>Add</button>
    </div>
  }
}
