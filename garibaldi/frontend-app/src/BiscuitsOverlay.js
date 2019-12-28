import React from "react";
import { useMemo } from "react";
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

export function BiscuitsOverlay({
  boundingBox,
  featureLoader,
  biscuitFinderLib
}) {
  const { BiscuitFinder, memory } = biscuitFinderLib;
  const biscuitFinder = useMemo(() => BiscuitFinder.new(), [BiscuitFinder]);

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
      console.time("redraw: biscuits");

      // FIXME: logically, I want to get top left / bottom right of bounding box
      // by asking for north west / south east points. however, that doesn't seem to
      // work and instead I need to get south west / north east instead.
      // const boundingBoxTopLeft = project(boundingBox.getNorthWest().toArray());
      // const boundingBoxBottomRight = project(
      //   boundingBox.getSouthEast().toArray()
      // );
      const boundingBoxTopLeft = project(boundingBox.getSouthWest().toArray());
      const boundingBoxBottomRight = project(
        boundingBox.getNorthEast().toArray()
      );

      const boundingBoxMinX = Math.floor(boundingBoxTopLeft[0]);
      const boundingBoxMinY = Math.floor(boundingBoxTopLeft[1]);
      const boundingBoxMaxX = Math.ceil(boundingBoxBottomRight[0]);
      const boundingBoxMaxY = Math.ceil(boundingBoxBottomRight[1]);
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
        boundingBoxMinX * window.devicePixelRatio,
        boundingBoxMinY * window.devicePixelRatio,
        boundingBoxWidth * window.devicePixelRatio,
        boundingBoxHeight * window.devicePixelRatio
      );
      console.timeEnd("getImageData");

      console.time("find_biscuits");
      biscuitFinder.find_biscuits(
        boundingBoxWidth * window.devicePixelRatio,
        boundingBoxHeight * window.devicePixelRatio,
        inputImageData.data
      );
      console.timeEnd("find_biscuits");

      console.time("get biscuits back");
      const outputPointer = biscuitFinder.output_ptr();
      const outputArray = new Uint8ClampedArray(
        memory.buffer,
        outputPointer,
        4 *
          boundingBoxWidth *
          window.devicePixelRatio *
          boundingBoxHeight *
          window.devicePixelRatio
      );

      const outputImageData = new ImageData(
        outputArray,
        boundingBoxWidth * window.devicePixelRatio,
        boundingBoxHeight * window.devicePixelRatio
      );
      console.timeEnd("get biscuits back");

      console.time("get bounding boxes back");
      const numBiscuits = biscuitFinder.num_bounding_boxes();
      const biscuitBoundingBoxesPointer = biscuitFinder.bounding_boxes_ptr();
      const biscuitBoundingBoxes = new Uint32Array(
        memory.buffer,
        biscuitBoundingBoxesPointer,
        4 * numBiscuits
      );
      console.timeEnd("get bounding boxes back");

      console.time("draw biscuits");
      // ctx.putImageData(
      //   outputImageData,
      //   boundingBoxMinX * window.devicePixelRatio,
      //   boundingBoxMinY * window.devicePixelRatio
      // );
      console.timeEnd("draw biscuits");

      console.time("draw bounding boxes");
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.rect(
        boundingBoxMinX,
        boundingBoxMinY,
        boundingBoxWidth,
        boundingBoxHeight
      );
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.strokeStyle = "red";
      console.log("num biscuits", numBiscuits);
      // for (let biscuitNum = 0; biscuitNum < numBiscuits; biscuitNum++) {
      for (let biscuitNum = 1; biscuitNum < 2; biscuitNum++) {
        const offset = biscuitNum * 4;
        const [minX, minY, maxX, maxY] = [
          biscuitBoundingBoxes[offset + 0],
          biscuitBoundingBoxes[offset + 1],
          biscuitBoundingBoxes[offset + 2],
          biscuitBoundingBoxes[offset + 3]
        ];
        const width = maxX - minX;
        const height = maxY - minY;

        console.log(
          boundingBoxMinX,
          boundingBoxMinY,
          boundingBoxWidth,
          boundingBoxHeight
        );
        console.log(minX, minY, maxX, maxY, width, height);

        ctx.putImageData(
          // outputImageData,
          inputImageData,
          boundingBoxMinX * window.devicePixelRatio +
            minX / window.devicePixelRatio,
          boundingBoxMinY * window.devicePixelRatio +
            minY / window.devicePixelRatio,
          minX,
          minY,
          width,
          height
        );
      }

      ctx.stroke();
      console.timeEnd("draw bounding boxes");

      console.timeEnd("redraw: biscuits");
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
