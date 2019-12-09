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

export function BiscuitOverlay({
  boundingBox,
  featureLoader,
  bufferContainerRef
}) {
  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    const geoJsonBounds = geoJsonBoundsFromLngLatBounds(boundingBox);

    const reticuleProjection = geoTransform({
      point: function(lon, lat) {
        const point = project(new LngLat(lon, lat).toArray());
        this.stream.point(point[0], point[1]);
      }
    });

    ctx.clearRect(0, 0, width, height);
    if (!isDragging) {
      // ctx.globalAlpha = 0.2;
      // ctx.beginPath();
      // ctx.fillStyle = "blue";
      // generator(geoJsonBounds);
      // ctx.fill();
      const features = featureLoader();
      const geoJson = { type: "FeatureCollection", features };

      const topLeft = project(boundingBox.getNorthWest().toArray());
      const bottomRight = project(boundingBox.getSouthEast().toArray());
      const reticuleWidth = bottomRight[0] - topLeft[0];
      const reticuleHeight = topLeft[1] - bottomRight[1];
      console.log(reticuleWidth, reticuleHeight);

      const offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.width = reticuleWidth;
      offScreenCanvas.height = reticuleHeight;
      bufferContainerRef.current.appendChild(offScreenCanvas);

      var offScreenCtx = offScreenCanvas.getContext("2d");

      const generator = geoPath()
        .projection(reticuleProjection)
        .context(offScreenCtx);

      // offScreenCtx.translate(-topLeft[0], -topLeft[1]);
      offScreenCtx.beginPath();
      offScreenCtx.arc(
        reticuleWidth / 2,
        reticuleHeight / 2,
        10.0,
        0,
        2 * Math.PI,
        false
      );
      offScreenCtx.fillStyle = "green";
      offScreenCtx.fill();
      offScreenCtx.lineWidth = 1;
      offScreenCtx.beginPath();
      offScreenCtx.strokeStyle = "red";
      generator(geoJson);
      offScreenCtx.stroke();

      ctx.drawImage(offScreenCanvas, topLeft[0], topLeft[1]);
    }
  }

  return <CanvasOverlay redraw={redraw} />;
}
