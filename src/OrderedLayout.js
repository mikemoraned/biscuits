class TransitionToFilledAreaBuilder {
    build(labels, background) {
        const widthBound = background.width;

        let nextY = 0;
        let nextX = 0;
        let maxRowHeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;
        const labelsWithOffsets = labels.map((label) => {
            const labelWithOffsets = {
                ...label,
                angle: 0.0,
                startAngle: label.min_area_rect.angle,
                startX: nextX,
                startY: nextY,
                startWidth: label.min_area_rect.width,
                startHeight: label.min_area_rect.height
            };

            maxHeight = Math.max(maxHeight, nextY + label.min_area_rect.height);
            maxWidth = Math.max(maxWidth, nextX + label.min_area_rect.width);

            maxRowHeight = Math.max(maxRowHeight, label.min_area_rect.height);
            nextX += label.min_area_rect.width;

            if (nextX >= widthBound) {
                nextX = 0;
                nextY += maxRowHeight;
                maxRowHeight = 0;
            }

            return labelWithOffsets;
        });

        const yScale = background.height / maxHeight;
        const withOffsetsAndScaled = labelsWithOffsets.map((label) => {
            return {
                ...label,
                startX: (yScale * label.startX) + background.width,
                startY: (yScale * label.startY),
                startWidth: (yScale * label.startWidth),
                startHeight: (yScale * label.startHeight),
            }
        });
        return {
            width: background.width + (yScale * maxWidth),
            height: background.height,
            background,
            transitions: withOffsetsAndScaled
        };
    }
}

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

        // const transitionBuilder = new TransitionToGridLayoutBuilder();
        const transitionBuilder = new TransitionToFilledAreaBuilder();

        return transitionBuilder.build(sortedBySize, background);
    }
}

export default OrderedLayout;