import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';

class ConnectedComponents extends Component {

    constructor() {
        super();

        this.state = { components: [] };
    }

    componentDidMount() {
        return fetch("edinburgh.labels.json")
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    components: json
                })
            });
    }

    render() {
        return (
            <ul className="components">
                {
                    this.state.components.map((component) => {
                        return <li>{ component.x }</li>
                    })
                }
            </ul>
        );
    }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <ConnectedComponents />
      </div>
    );
  }
}

export default App;
