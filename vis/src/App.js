import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';

class ConnectedComponents extends Component {

    constructor(props) {
        super(props);

        this.state = {
            components: [],
            showStart: true,
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {

        return fetch(`${this.props.name}.labels.json`)
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
        let maxWidth = 0;
        grid.forEach((row) => {
            let totalX = 0;
            let maxRowHeight = 0;
            row.forEach(c => {
                c.startX = totalX;
                c.startY = totalY;
                totalX += c.width;
                maxRowHeight = Math.max(maxRowHeight, c.height);
            });
            maxWidth = Math.max(maxWidth, totalX);
            totalY += maxRowHeight;
        });
        const maxHeight = totalY;
        const flattened = [];
        grid.forEach((row) => {
            row.forEach(c => {
                flattened.push(c);
            });
        });
        const yScale = background.height / maxHeight;
        const withOffsetsAndScaled = flattened.map((c) => {
            return {
                ...c,
                startX: ((yScale * c.startX) + background.width),
                startY: (yScale * c.startY),
                startWidth: (yScale * c.width),
                startHeight: (yScale * c.height),
            }
        });
        return withOffsetsAndScaled;
    }

    toggle() {
        this.setState({
            showStart: !this.state.showStart
        });
    }

    render() {
        return (
            <div className="biscuits">
                <div className="original">
                    <img src={`/${this.props.name}.png`} alt="original" onClick={this.toggle}/>
                </div>
                <div className="components">
                    {
                        this.state.components.map((component, index) => {
                            const startStyle = {
                                left: component.startX,
                                top: component.startY,
                                height: component.startHeight,
                                width: component.startWidth,
                                transform: `rotate(${-1 * component.angle}deg)`
                            };
                            const endStyle = {
                                left: component.x,
                                top: component.y,
                                height: component.height,
                                width: component.width,
                                transform: "rotate(0deg)"
                            };
                            const style = this.state.showStart ? startStyle: endStyle;
                            const url = `/${this.props.name}.label_${component.id}.png`;
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
      // const names = ["edinburgh", "budapest", "jerusalem",  "newyork" ];
      const names = ["edinburgh", "budapest", "jerusalem" ];
      // const names = ["edinburgh", "budapest"];
      return (
          <div className="App">
              <b>Zoom out to see</b>
              { names.map((name) => (
                  <div>
                      <h1>{name}</h1>
                      <ConnectedComponents name={name} />
                  </div>
              ))}
          </div>
      );
  }
}

export default App;
