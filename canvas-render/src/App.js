import React, { Component } from 'react';
import './App.css';
import { interpolate } from 'd3-interpolate';
import _ from 'underscore';

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
                value: Math.max(0.0, Math.min(1.0, elapsed / this.duration))
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

        this.grid = new Grid(4 * 50, 4 * 25);
    }

    render() {
        return (
          <div className="App">
              {/*<div>*/}
                  {/*<CSSTransition grid={this.grid} />*/}
              {/*</div>*/}
              <div>
                  <CanvasTransition grid={this.grid} width={400} height={200}/>
              </div>
          </div>
        );
    }
}

export default App;
