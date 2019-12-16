import React from "react";
import { CanvasOverlay } from "react-map-gl";
import { LngLat } from "mapbox-gl";
import { geoPath, geoTransform } from "d3-geo";

function geoJsonBoundsFromLngLatBounds(bounds) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              bounds.getNorthEast().toArray(),
              bounds.getSouthEast().toArray(),
              bounds.getSouthWest().toArray(),
              bounds.getNorthWest().toArray(),
              bounds.getNorthEast().toArray()
            ]
          ]
        }
      }
    ]
  };
}

export function BiscuitsOverlay({ boundingBox, featureLoader, biscuitFinder }) {
  const { BiscuitFinder, memory } = biscuitFinder;

  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    ctx.clearRect(0, 0, width, height);

    const geoJsonBounds = geoJsonBoundsFromLngLatBounds(boundingBox);

    const reticuleProjection = geoTransform({
      point: function(lon, lat) {
        const point = project(new LngLat(lon, lat).toArray());
        this.stream.point(point[0], point[1]);
      }
    });

    const generator = geoPath()
      .projection(reticuleProjection)
      .context(ctx);

    if (!isDragging) {
      console.log(boundingBox);
      console.log(width, height);

      // const boundingBoxTopLeft = project(boundingBox.getNorthWest().toArray());
      // const boundingBoxBottomRight = project(
      //   boundingBox.getSouthEast().toArray()
      // );

      const boundingBoxTopLeft = project(boundingBox.getSouthWest().toArray());
      const boundingBoxBottomRight = project(
        boundingBox.getNorthEast().toArray()
      );

      console.log(boundingBoxTopLeft, boundingBoxBottomRight);

      const boundingBoxMinX = Math.floor(
        boundingBoxTopLeft[0] * window.devicePixelRatio
      );
      const boundingBoxMinY = Math.floor(
        boundingBoxTopLeft[1] * window.devicePixelRatio
      );
      const boundingBoxMaxX = Math.ceil(
        boundingBoxBottomRight[0] * window.devicePixelRatio
      );
      const boundingBoxMaxY = Math.ceil(
        boundingBoxBottomRight[1] * window.devicePixelRatio
      );
      const boundingBoxWidth = boundingBoxMaxX - boundingBoxMinX;
      const boundingBoxHeight = boundingBoxMaxY - boundingBoxMinY;

      console.time("drawing map");
      ctx.fillStyle = "black";
      ctx.fillRect(
        boundingBoxMinX,
        boundingBoxMinY,
        boundingBoxWidth,
        boundingBoxHeight
      );

      console.log(
        boundingBoxMinX,
        boundingBoxMinY,
        boundingBoxWidth,
        boundingBoxHeight
      );

      const features = featureLoader();
      const geoJson = { type: "FeatureCollection", features };

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.strokeStyle = "white";
      generator(geoJson);
      ctx.stroke();
      console.timeEnd("drawing map");

      console.time("getImageData");
      const inputImageData = ctx.getImageData(
        boundingBoxMinX,
        boundingBoxMinY,
        boundingBoxWidth,
        boundingBoxHeight
      );
      console.dir(inputImageData);
      console.timeEnd("getImageData");

      console.time("find_biscuits");
      const biscuitFinder = BiscuitFinder.new(
        boundingBoxWidth,
        boundingBoxHeight
      );
      console.dir(biscuitFinder.find_biscuits(inputImageData.data));
      console.timeEnd("find_biscuits");

      console.time("get biscuits back");
      const outputPointer = biscuitFinder.output();
      const outputArray = new Uint8ClampedArray(
        memory.buffer,
        outputPointer,
        4 * boundingBoxWidth * boundingBoxHeight
      );

      const outputImageData = new ImageData(
        outputArray,
        boundingBoxWidth,
        boundingBoxHeight
      );
      console.timeEnd("get biscuits back");

      console.time("draw biscuits");
      ctx.putImageData(outputImageData, boundingBoxMinX, boundingBoxMinY);
      console.timeEnd("draw biscuits");
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([15, 15]);
    ctx.strokeStyle = "green";
    generator(geoJsonBounds);
    ctx.stroke();
  }

  return <CanvasOverlay redraw={redraw} />;
}
