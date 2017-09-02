import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';

class ConnectedComponents extends Component {

    constructor() {
        super();

        this.state = {
            // name: "newyork",
            // name: "edinburgh",
            name: "budapest",
            components: [],
            showStart: true,
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {

        return fetch(`${this.state.name}.labels.json`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    components: this.layout(json)
                })
            });
    }

    layout(components) {
        const withoutBackground = components.slice(0);
        const background = withoutBackground.shift();

        const sortedBySize = withoutBackground.map((c) => {
            return {
                size: (c.width * c.height),
                ...c
            }
        });
        sortedBySize.sort((a, b) => (b.size - a.size));

        const gridSideLength = Math.ceil(Math.sqrt(sortedBySize.length));
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
        const withOffsets = flattened.map((c) => {
            return {
                ...c,
                startX: (c.startX + background.width),
            }
        });
        return withOffsets;
    }

    toggle() {
        this.setState({
            showStart: !this.state.showStart
        });
    }

    render() {
        return (
            <div>
                <div className="original">
                    <img src={`/${this.state.name}.png`} alt="original" onClick={this.toggle}/>
                </div>
                <div className="components">
                    {
                        this.state.components.map((component, index) => {
                            const startStyle = {
                                left: component.startX,
                                top: component.startY,
                                height: component.startHeight,
                                width: component.startWidth,
                            };
                            const endStyle = {
                                left: component.x,
                                top: component.y,
                                height: component.height,
                                width: component.width,
                            };
                            const style = this.state.showStart ? startStyle: endStyle;
                            const url = `/${this.state.name}.label_${component.id}.png`;
                            return <img key={index}
                                        src={url}
                                        alt={`label_${component.id}`}
                                        style={style}
                                        onClick={this.toggle} />;
                        })
                    }
                </div>
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
