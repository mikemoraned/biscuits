import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';
import { easeCubicInOut } from "d3-ease";

class ConnectedComponents extends Component {

    constructor() {
        super();

        this.state = {
            components: [],
            t: 0.0,
            transitionDuration: 8000,
            ease: easeCubicInOut
        };
    }

    componentDidMount() {

        const setT = () => {
            const currentDate = new Date();
            const t = (currentDate.getTime() % this.state.transitionDuration) / this.state.transitionDuration;
            this.setState({ t });
            requestAnimationFrame(setT);
        }
        setT();

        return fetch("edinburgh.labels.json")
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    components: json
                })
            });
    }

    t() {
        return this.state.ease(this.state.t);
    }

    render() {
        return (
            <div className="components">
                {
                    this.state.components.map((component) => {
                        const style = {
                            left: this.t() * component.x,
                            top: this.t() * component.y,
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
