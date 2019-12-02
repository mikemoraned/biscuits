import React from "react";
import { useContext } from "react";
import { MapBoxContext } from "./MapBoxContext";
import { useRef, useLayoutEffect, useState } from "react";
import ReactMapGL from "react-map-gl";
import { CanvasOverlay } from "react-map-gl";
import { LngLatBounds } from "mapbox-gl";
import { geoProjection, geoPath } from "d3-geo";

function BoundingBoxOverlay({ boundingBox }) {
  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    const center = project(boundingBox.getCenter().toArray());
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(center[0], center[1], 10.0, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();

    const topLeft = project(boundingBox.getNorthWest().toArray());
    const bottomRight = project(boundingBox.getSouthEast().toArray());
    ctx.beginPath();
    ctx.rect(
      topLeft[0],
      topLeft[1],
      bottomRight[0] - topLeft[0],
      bottomRight[1] - topLeft[1]
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  return <CanvasOverlay redraw={redraw} />;
}

function FeatureOverlay({ boundingBox, features }) {
  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    console.log(width, height);
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, width, height);
    // ctx.fill();

    const center = project(boundingBox.getCenter().toArray());
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(center[0], center[1], 10.0, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();

    console.dir("drawing features: started");
    const geoJson = { type: "FeatureCollection", features };
    const geoJsonBounds = geoJsonBoundsFromLngLatBounds(boundingBox);

    const topLeft = project(boundingBox.getNorthWest().toArray());
    const bottomRight = project(boundingBox.getSouthEast().toArray());

    // const reticuleProjection = geoMercator().fitExtent(
    //   [
    //     [topLeft[0], topLeft[1]],
    //     [bottomRight[0], bottomRight[1]]
    //   ],
    //   geoJsonBounds
    // );

    const reticuleProjection = geoProjection(function(xRadians, yRadians) {
      const xDegrees = (xRadians * 180.0) / Math.PI;
      const yDegrees = (yRadians * 180.0) / Math.PI;
      const projected = project([xDegrees, yDegrees]);

      // console.log([xRadians, yRadians], [xDegrees, yDegrees], projected);

      return projected;
    });

    const generator = geoPath(reticuleProjection).context(ctx);

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    generator(geoJsonBounds);
    ctx.stroke();

    ctx.beginPath();
    generator(geoJson);
    ctx.strokeStyle = "red";
    ctx.stroke();
    console.dir("drawing features: completed");
  }

  return <CanvasOverlay redraw={redraw} />;
}

function reticuleFromMapBounds(bounds) {
  const northSouthExtent = bounds.getSouth() - bounds.getNorth();
  const westEastExtent = bounds.getEast() - bounds.getWest();

  const indent = 0.2;

  const reticuleBounds = LngLatBounds.convert([
    [
      bounds.getWest() + indent * westEastExtent,
      bounds.getNorth() + indent * northSouthExtent
    ],
    [
      bounds.getWest() + (1.0 - indent) * westEastExtent,
      bounds.getNorth() + (1.0 - indent) * northSouthExtent
    ]
  ]);

  return reticuleBounds;
}

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

export function MapView({ city }) {
  const mapbox = useContext(MapBoxContext);
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 800
  });
  const [reticuleBounds, setReticuleBounds] = useState(null);
  const [features, setFeatures] = useState(null);

  useLayoutEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  }, [containerRef]);

  const { width, height } = containerDimensions;

  const [viewport, setViewport] = useState({
    zoom: mapbox.default_zoom,
    ...city.location
  });
  function viewportUpdated(viewport) {
    const { zoom, latitude, longitude } = viewport;
    setViewport({ zoom, latitude, longitude });
  }

  function onBoundsChanged(map) {
    const reticule = reticuleFromMapBounds(map.getBounds());
    setReticuleBounds(reticule);
    setFeatures(map.queryRenderedFeatures(reticule));
  }

  function onLoad({ target }) {
    const map = target;
    console.log("loaded");
    onBoundsChanged(map);
    map.on("moveend", () => {
      onBoundsChanged(map);
    });
  }

  return (
    <div ref={containerRef} className="map">
      <ReactMapGL
        width={width}
        height={height}
        {...viewport}
        onViewportChange={viewportUpdated}
        mapboxApiAccessToken={mapbox.access_token}
        onLoad={onLoad}
      >
        {/* {reticuleBounds && <BoundingBoxOverlay boundingBox={reticuleBounds} />} */}
        {reticuleBounds && features && (
          <FeatureOverlay boundingBox={reticuleBounds} features={features} />
        )}
      </ReactMapGL>
    </div>
  );
}
