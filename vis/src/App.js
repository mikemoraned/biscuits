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
            <div className="components">
                {
                    this.state.components.map((component) => {
                        const style = {
                            left: component.x,
                            top: component.y,
                            height: component.height,
                            width: component.width,
                            backgroundPositionX: -component.x,
                            backgroundPositionY: -component.y
                        };
                        return <div style={style}>&nbsp;</div>
                    })
                }
            </div>
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
