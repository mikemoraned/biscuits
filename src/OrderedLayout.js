class OrderedLayout {

    reduceBoundingBox(bb, border) {
        return {
            x: bb.x + (border * bb.width / 2.0),
            y: bb.y + (border * bb.height / 2.0),
            width: (1.0 - (border * 2)) * bb.width,
            height: (1.0 - (border * 2)) * bb.height
        };
    }

    withinInterval(p, min, max) {
        return p >= min && p <= max;
    }

    containedWithin(bb, outer) {
        return (
           this.withinInterval(   bb.x,             outer.x,   outer.x + outer.width)
           && this.withinInterval(bb.x + bb.width,  outer.x,   outer.x + outer.width)
           && this.withinInterval(bb.y,             outer.y,   outer.y + outer.height)
           && this.withinInterval(bb.y + bb.height, outer.y,   outer.y + outer.height)
        );
    }

    stripBorderPieces(labels, background) {
        const border = 0.05;
        const backgroundBoundingBox = {
            x: background.x,
            y: background.y,
            width: background.width,
            height: background.height
        };
        const centralArea = this.reduceBoundingBox(backgroundBoundingBox, border);

        return labels.filter((l) => this.containedWithin(l, centralArea));
    }

    layout(labels) {
        const withoutBackground = labels.slice(0);
        const background = withoutBackground.shift();

        const stripped = this.stripBorderPieces(withoutBackground, background);

        const sortedBySize = stripped.map((c) => {
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

export default OrderedLayout;