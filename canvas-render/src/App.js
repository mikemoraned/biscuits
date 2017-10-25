import React, { Component } from 'react';
import './App.css';
import { interpolate } from 'd3-interpolate';
import _ from 'underscore';
import { easeCubicInOut } from 'd3-ease';

class Grid {

    constructor(columns, rows) {
        this.columns = columns;
        this.rows = rows;

        this.shuffledAddresses = _.shuffle(this.addresses());
    }

    addresses() {
        let addresses = [];
        for (let column = 0; column < this.columns; column++) {
            for (let row = 0; row < this.rows; row++) {
                addresses.push({
                    column,
                    row
                });
            }
        }
        return addresses;
    }

    addressToBox(address, width, height) {
        const { column, row } = address;
        return {
            column,
            row,
            x: column * width,
            y: row * height,
            width,
            height
        }
    }

    spreadOver(width, height) {
        const xStride = width / this.columns;
        const yStride = height / this.rows;
        return _.zip(this.addresses(), this.shuffledAddresses).map((pair) => {
            console.dir(pair);
            const [startAddress, endAddress] = pair;
            return {
                start: this.addressToBox(startAddress, xStride, yStride),
                end: this.addressToBox(endAddress, xStride, yStride),
            }
        })
    }
}

class CSSTransition extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            toStart: true,
        };

        this.toggle = this.toggle.bind(this);
        this.boxStyle = this.boxStyle.bind(this);
        this.grid = props.grid;
        this.colorInterpolate = interpolate("#0000FF","#FFCCCC");
    }

    toggle() {
        this.setState({
            toStart: !this.state.toStart
        });
    }

    boxStyle(box, defaults) {
        return {
            ...defaults,
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
        }
    }

    entryStyle(entry, index, entryCount) {
        const color = this.colorInterpolate(index / entryCount);
        if (this.state.toStart) {
            return this.boxStyle(entry.start, {
                backgroundColor: color
            });
        }
        else {
            return this.boxStyle(entry.end, {
                backgroundColor: color,
                transform: "rotate(180deg)"
            });
        }
    }

    render() {
        const entries = this.props.grid.spreadOver(this.props.width, this.props.height);
        return (
            <div className="css_transition">
                {
                    entries.map((entry, index) => {
                        return <div onClick={this.toggle} style={this.entryStyle(entry, index, entries.length)} className="box"></div>
                    })
                }
            </div>
        );
    }
}

class CanvasTransition extends React.Component {

    constructor(props) {
        super(props);

        this.duration = 4 * 1000.0;
        this.state = {
            toStart: true,
            value: 0,
        };

        this.angleInterpolate = interpolate(0,180);
        this.colorInterpolate = interpolate("#0000FF","#FFCCCC");
        this.interpolations = this.buildInterpolations();
        this.ease = easeCubicInOut;

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            toStart: !this.state.toStart,
        });

        let start = 0;
        const step = (timestamp) => {
            if (start === 0) {
                start = timestamp;
            }
            var elapsed = timestamp - start;
            if (!(elapsed > this.duration)) {
                requestAnimationFrame(step);
            }
            this.setState({
                value: this.ease(Math.max(0.0, Math.min(1.0, elapsed / this.duration)))
            })
        };
        requestAnimationFrame(step);
    }

    t() {
        if (this.state.toStart) {
            return 1.0 - this.state.value;
        }
        else {
            return this.state.value;
        }
    }

    buildInterpolations() {
        const entries = this.props.grid.spreadOver(this.props.width, this.props.height);
        return entries.map((entry, index) => {
            const { start, end} = entry;
            return {
                x: interpolate(start.x, end.x),
                y: interpolate(start.y, end.y),
                width: interpolate(start.width, end.width),
                height: interpolate(start.height, end.height),
                color: this.colorInterpolate(index / entries.length)
            }
        });
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0,0, this.props.width, this.props.height);
        this.interpolations.forEach((i) => {
            this.rect({ctx,
                x: i.x(this.t()),
                y: i.y(this.t()),
                width: i.width(this.t()),
                height: i.height(this.t()),
                angle: this.angleInterpolate(this.t()),
                color: i.color});
        });
    }

    rect(props) {
        const {ctx, x, y, width, height, angle, color } = props;
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.strokeWidth = "1px";
        ctx.fillStyle = color;
        ctx.translate(x + (width / 2), y + (height / 2));
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillRect(-(width / 2), -(height / 2), width, height);
        ctx.restore();
    }

    render() {
        return (
            <div className="canvas_transition">
                <canvas onClick={this.toggle} ref="canvas" width={this.props.width} height={this.props.height}/>
                <div>{this.state.value}</div>
            </div>
        );
    }
}

class App extends Component {

    constructor(props) {
        super(props);

        // ok in both:
        this.grid = new Grid(1 * 25, 1 * 12);

        // starting to get chuggy in css:
        // this.grid = new Grid(2 * 25, 2 * 12);

        // chugtastic:
        // this.grid = new Grid(3 * 25, 3 * 12);

        // css transition kills chrome and computer:
        // this.grid = new Grid(4 * 50, 4 * 25);
    }

    render() {
        return (
          <div className="App">
              <div>
                  <CSSTransition grid={this.grid} width={400} height={200}/>
              </div>
              <div>
                  <CanvasTransition grid={this.grid} width={400} height={200}/>
              </div>
          </div>
        );
    }
}

export default App;
