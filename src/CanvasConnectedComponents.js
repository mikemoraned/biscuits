import React, { Component } from 'react';

import { interpolate } from 'd3-interpolate';
import { easeCubicInOut } from 'd3-ease';
import OrderedLayout from './OrderedLayout';
import ImageResolver from './ImageResolver';

class CanvasConnectedComponents extends Component {

    constructor(props) {
        super(props);

        this.duration = 4 * 1000.0;
        this.layout = new OrderedLayout();
        this.imageResolver = new ImageResolver(props.name);
        this.state = {
            toStart: true,
            becameVisible: false,
            value: 1.0,
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
        this.toggleWhenFirstVisible = this.toggleWhenFirstVisible.bind(this);
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

                this.toggleWhenFirstVisible();
                window.addEventListener('scroll', this.toggleWhenFirstVisible);
                window.addEventListener('resize', this.toggleWhenFirstVisible);
            });
    }

    toggleWhenFirstVisible() {
        const bounds = this.refs.canvas.getBoundingClientRect();
        if (bounds.top <= (window.innerHeight - (bounds.height / 2)) && !this.state.becameVisible) {
            window.removeEventListener('scroll', this.toggleWhenFirstVisible);
            window.removeEventListener('resize', this.toggleWhenFirstVisible);

            this.setState({
                becameVisible: true,
            });
            this.toggle();
        }
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

export default CanvasConnectedComponents;