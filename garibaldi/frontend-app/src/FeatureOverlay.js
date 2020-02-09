import React from "react";
import { CanvasOverlay } from "react-map-gl";
import { geoJsonBoundsFromLngLatBounds } from "./overlayHelpers";
import { createFeatureRenderer } from "./featureRenderer";

export function FeatureOverlay({ boundingBox, featureLoader }) {
  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    const center = project(boundingBox.getCenter().toArray());
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(center[0], center[1], 10.0, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();

    const geoJsonBounds = geoJsonBoundsFromLngLatBounds(boundingBox);

    const featureRenderer = createFeatureRenderer(project, ctx);

    if (!isDragging) {
      console.time("redraw: all");
      const features = featureLoader();
      const geoJson = { type: "FeatureCollection", features };

      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      featureRenderer(geoJson);
      ctx.stroke();
      console.timeEnd("redraw: all");
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    featureRenderer(geoJsonBounds);
    ctx.stroke();
  }

  return <CanvasOverlay redraw={redraw} />;
}
