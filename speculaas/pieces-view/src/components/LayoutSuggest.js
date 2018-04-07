import * as React from "react";
import { layouts } from "./layouts";
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export class LayoutSuggest extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedOption: { value: props.layoutId, label: props.layoutId }
    }
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    if (selectedOption !== null) {
      this.props.onChange(selectedOption.value);
    }
  }

  render() {
    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.value;

    return (
      <Select
        name="form-field-name"
        value={value}
        onChange={this.handleChange}
        options={layouts.map(layout => ({ value: layout.id, label: layout.id }))}
      />
    );
  }
}