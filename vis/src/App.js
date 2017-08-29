import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';
import { easeCubicInOut } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";

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
                    components: this.addInterpolations(this.layout(json))
                })
            });
    }

    addInterpolations(components) {
        return components.map((c) => {
            return {
                xInterpolator: interpolateNumber(c.startX, c.x),
                yInterpolator: interpolateNumber(c.startY, c.y),
                widthInterpolator: interpolateNumber(c.startWidth, c.width),
                heightInterpolator: interpolateNumber(c.startHeight, c.height),
                ...c
            }
        });
    }

    layout(components) {
        const sortedBySize = components.map((c) => {
            return {
                size: (c.width * c.height),
                ...c
            }
        });
        sortedBySize.sort((a, b) => (b.size - a.size));

        const gridSideLength = Math.ceil(Math.sqrt(sortedBySize.length));
        const gridXStride = 100;
        const gridYStride = 100;
        return sortedBySize.map((c, index) => {
           const xBucket = index % gridSideLength;
           const yBucket = Math.floor(index / gridSideLength);
           return {
               startX: xBucket * gridXStride,
               startY: yBucket * gridYStride,
               startWidth: gridXStride,
               startHeight: gridYStride,
               ...c
           }
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
                            left: component.xInterpolator(this.t()),
                            top: component.yInterpolator(this.t()),
                            height: component.heightInterpolator(this.t()),
                            width: component.widthInterpolator(this.t()),
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
