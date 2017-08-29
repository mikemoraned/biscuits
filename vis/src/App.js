import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';
import { easeCubicInOut } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";

class ConnectedComponents extends Component {

    constructor() {
        super();

        this.state = {
            name: "edinburgh",
            components: [],
            t: 0.0,
            transitionDuration: 16000,
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

        return fetch(`${this.state.name}.labels.json`)
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
        const grid = sortedBySize.reduce((grid, c, index) => {
            const gridInsert = (array, x, y, value) => {
                let row = array[y];
                if (row == null) {
                    row = [];
                    array[y] = row;
                }
                row[x] = value;
            }
            const xBucket = index % gridSideLength;
            const yBucket = Math.floor(index / gridSideLength);
            gridInsert(grid, xBucket, yBucket, c);
            return grid;
        }, []);
        let totalY = 0;
        grid.forEach((row) => {
            let totalX = 0;
            let maxRowHeight = 0;
            row.forEach(c => {
                c.startX = totalX;
                c.startY = totalY;
                totalX += c.width;
                maxRowHeight = Math.max(maxRowHeight, c.height);
            });
            totalY += maxRowHeight;
        });
        const flattened = [];
        grid.forEach((row) => {
            row.forEach(c => {
                flattened.push(c);
            });
        });
        return flattened;
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
                            width: component.widthInterpolator(this.t())
                        };
                        const url = `/${this.state.name}.label_${component.id}.png`;
                        return <img src={url} alt={`label_${component.id}`} style={style} />;
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
