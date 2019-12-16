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
      const topLeft = project(boundingBox.getNorthWest().toArray());
      const bottomRight = project(boundingBox.getSouthEast().toArray());

      console.time("drawing map");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      const features = featureLoader();
      const geoJson = { type: "FeatureCollection", features };

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.strokeStyle = "white";
      generator(geoJson);
      ctx.stroke();
      console.timeEnd("drawing map");

      console.log(topLeft, bottomRight);
      console.time("getImageData");
      // const inputImageData = ctx.getImageData(
      //   topLeft[0],
      //   topLeft[1],
      //   bottomRight[0] - topLeft[0],
      //   bottomRight[1] - topLeft[1]
      // );
      const inputImageData = ctx.getImageData(0, 0, width, height);
      console.dir(inputImageData);
      console.timeEnd("getImageData");

      console.time("find_biscuits");
      const biscuitFinder = BiscuitFinder.new(width, height);
      console.dir(biscuitFinder.find_biscuits(inputImageData.data));
      console.timeEnd("find_biscuits");

      console.time("get biscuits back");
      const outputPointer = biscuitFinder.output();
      const outputArray = new Uint8ClampedArray(
        memory.buffer,
        outputPointer,
        4 * width * height
      );

      const outputImageData = new ImageData(outputArray, width, height);
      console.timeEnd("get biscuits back");

      console.time("draw biscuits");
      ctx.putImageData(outputImageData, 0, 0);
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
