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
      console.time("getImageData");
      const inputImageData = ctx.getImageData(0, 0, width, height);
      console.timeEnd("getImageData");
      console.time("find_biscuits");
      const biscuitFinder = BiscuitFinder.new(width, height);
      console.dir(biscuitFinder.find_biscuits(inputImageData.data));
      console.timeEnd("find_biscuits");
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
