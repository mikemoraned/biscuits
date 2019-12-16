import React from "react";
import { useState, useEffect } from "react";
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

export function BiscuitsOverlay({ boundingBox, featureLoader }) {
  const [biscuitFinder, setBiscuitFinder] = useState(null);

  useEffect(() => {
    if (biscuitFinder == null) {
      loadBiscuitFinder({
        setBiscuitFinder
      });
    }
  }, [biscuitFinder]);

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

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = "blue";
    generator(geoJsonBounds);
    ctx.stroke();

    if (biscuitFinder) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.setLineDash([15, 15]);
      ctx.strokeStyle = "green";
      generator(geoJsonBounds);
      ctx.stroke();
    }
  }

  return <CanvasOverlay redraw={redraw} />;
}

// class BiscuitFinderLayer {
//   constructor({ width, height, biscuitFinder, memory }) {
//     this.width = width;
//     this.height = height;
//     this.biscuitFinder = biscuitFinder;
//     this.memory = memory;
//   }

//   draw(context) {
//     console.time("BiscuitFinderLayer.draw");
//     const inputImageData = context.getImageData(0, 0, this.width, this.height);
//     console.time("find biscuits");
//     console.dir(this.biscuitFinder.find_biscuits(inputImageData.data));
//     console.timeEnd("find biscuits");

//     console.time("draw image");
//     const outputPointer = this.biscuitFinder.output();
//     const outputArray = new Uint8ClampedArray(
//       this.memory.buffer,
//       outputPointer,
//       4 * this.width * this.height
//     );

//     const outputImageData = new ImageData(outputArray, this.width, this.height);

//     context.putImageData(outputImageData, 0, 0);
//     console.timeEnd("draw image");
//     console.timeEnd("BiscuitFinderLayer.draw");
//   }
// }

function loadBiscuitFinder({ setBiscuitFinder }) {
  console.time("loadBiscuitFinder");
  Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ])
    .then(([biscuiting, biscuiting_bg]) => {
      const { BiscuitFinder } = biscuiting;
      const { memory } = biscuiting_bg;

      setBiscuitFinder({ BiscuitFinder, memory });
      console.timeEnd("loadBiscuitFinder");
    })
    .catch(err => {
      console.log(err);
    });
}
