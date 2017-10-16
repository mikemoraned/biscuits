import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';
import { interpolate } from 'd3-interpolate';
import { easeCubicInOut } from 'd3-ease';

class OrderedLayout {
    layout(labels) {
        const withoutBackground = labels.slice(0);
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
                startX: (yScale * c.startX) + background.width,
                startY: (yScale * c.startY),
                startWidth: (yScale * c.width),
                startHeight: (yScale * c.height),
            }
        });
        return {
            width: background.width + maxWidth,
            height: background.height,
            background,
            transitions: withOffsetsAndScaled
        };
    }
}

class ImageResolver {
    constructor(baseName) {
        this.baseName = baseName;
    }

    resolveImages(withIds, labels, callback) {
        const labelsById = [];
        labels.forEach((label) => {
            labelsById[label["id"]] = label;
        });
        const imageName = `data/${this.baseName}.label_sprites.png`;
        return fetch(imageName)
            .then((response) => {
                console.log(`${imageName}: ${response.status}`);
                return response.blob();
            })
            .then((blob) => {
                return window.createImageBitmap(blob);
            })
            .then((spriteBitmap) => {
                return Promise.all(withIds.map((withId) => {
                    const id = withId.id;
                    const label = labelsById[id];
                    return window.createImageBitmap(spriteBitmap, label.sprite_offset, 0, label.width, label.height)
                        .then((bitmap) => {
                            console.log(`${imageName}: ${id}: created bitmap`);
                            return { id, bitmap };
                        });
                }));
            })
            .then((bitmapWithIds) => {
                const images = [];
                bitmapWithIds.forEach((bitmapWithId) => {
                   const { id, bitmap } = bitmapWithId;
                   images[id] = bitmap;
                });
                callback(images);
            });
    }
}

class CanvasConnectedComponents extends Component {

    constructor(props) {
        super(props);

        this.duration = 4 * 1000.0;
        this.layout = new OrderedLayout();
        this.imageResolver = new ImageResolver(props.name);
        this.state = {
            toStart: true,
            value: 0.30,
            layout: {
                width: 100,
                height: 100,
                background: {
                    width: 100,
                    height: 50,
                },
                interpolations: []
            },
            images: {}
        };

        this.toggle = this.toggle.bind(this);
        this.buildInterpolations = this.buildInterpolations.bind(this);
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
            return easeCubicInOut(1.0 - this.state.value);
        }
        else {
            return easeCubicInOut(this.state.value);
        }
    }

    buildInterpolations(labels) {
        const layout = this.layout.layout(labels);
        const interpolations = layout.transitions.map((entry) => {
            return {
                ...entry,
                x: interpolate(entry.startX, entry.x),
                y: interpolate(entry.startY, entry.y),
                width: interpolate(entry.startWidth, entry.width),
                height: interpolate(entry.startHeight, entry.height),
                color: "red"
            }
        });
        this.setState({
            layout: {
                ...layout,
                interpolations,
            }
        });
        this.imageResolver.resolveImages(layout.transitions, labels, (images) => {
            this.setState({
                images
            });
        });
    }

    componentDidMount() {
        this.updateCanvas();

        return fetch(`data/${this.props.name}.labels.json`)
            .then((response) => response.json())
            .then((labels) => {
                console.log("Got labels");
                this.buildInterpolations(labels);
            });
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0,0, this.state.layout.width, this.state.layout.height);
        this.rect({ctx,
            x: 0,
            y: 0,
            width: this.state.layout.background.width,
            height: this.state.layout.background.height,
            angle: 0,
            color: "green"});
        this.state.layout.interpolations.forEach((i) => {
            if (this.state.images[i.id]) {
                this.image({ctx,
                    x: i.x(this.t()),
                    y: i.y(this.t()),
                    width: i.width(this.t()),
                    height: i.height(this.t()),
                    angle: 0,
                    imageBitmap: this.state.images[i.id]});
            }
            else {
                this.rect({ctx,
                    x: i.x(this.t()),
                    y: i.y(this.t()),
                    width: i.width(this.t()),
                    height: i.height(this.t()),
                    angle: 0,
                    color: i.color});
            }
        });
    }

    image(props) {
        const {ctx, x, y, width, height, angle, imageBitmap } = props;
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.strokeWidth = "1px";
        // ctx.fillStyle = color;
        ctx.translate(x + (width / 2), y + (height / 2));
        ctx.rotate(angle * Math.PI / 180);
        // ctx.fillRect(-(width / 2), -(height / 2), width, height);
        ctx.drawImage(imageBitmap, -(width / 2), -(height / 2), width, height);
        ctx.restore();
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
                <canvas onClick={this.toggle} ref="canvas"
                        width={this.state.layout.width}
                        height={this.state.layout.height}/>
                <div>{this.state.value}</div>
            </div>
        );
    }
}

class App extends Component {
  render() {
      const names = ["edinburgh", "budapest", "jerusalem",  "newyork", "au" ];
      // const names = ["edinburgh", "budapest", "jerusalem" ];
      // const names = ["budapest"];
      // const names = ["edinburgh"];
      // const names = ["jerusalem"];
      // const names = ["newyork"];
      // const names = ["budapest", "jerusalem" ];
      return (
          <div className="App">
              <b>Instructions: Zoom out to see, click on shapes / city to animate</b>
              { names.map((name) => (
                  <div key={name}>
                      <h1>{name}</h1>
                      <CanvasConnectedComponents name={name} />
                  </div>
              ))}
          </div>
      );
  }
}

export default App;
