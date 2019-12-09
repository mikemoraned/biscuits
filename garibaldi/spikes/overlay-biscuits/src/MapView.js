import React from "react";
import { useContext } from "react";
import { MapBoxContext } from "./MapBoxContext";
import { useRef, useLayoutEffect, useState } from "react";
import ReactMapGL from "react-map-gl";
import { CanvasOverlay } from "react-map-gl";
import { LngLatBounds, LngLat } from "mapbox-gl";
import { geoPath, geoTransform } from "d3-geo";

function FeatureOverlay({ boundingBox, featureLoader }) {
  function redraw({ width, height, ctx, isDragging, project, unproject }) {
    const center = project(boundingBox.getCenter().toArray());
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(center[0], center[1], 10.0, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();

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
      console.time("redraw: all");
      const features = featureLoader();
      const geoJson = { type: "FeatureCollection", features };

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      generator(geoJson);
      ctx.stroke();
      console.timeEnd("redraw: all");
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    generator(geoJsonBounds);
    ctx.stroke();
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
  const [featureLoader, setFeatureLoader] = useState(null);

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
    setFeatureLoader(() => {
      return () => {
        return map.queryRenderedFeatures(
          [
            map.project(reticule.getNorthEast().toArray()),
            map.project(reticule.getSouthWest().toArray())
          ],
          {
            filter: [
              "in",
              "class",
              "street",
              "pedestrian",
              "motorway",
              "motorway_link",
              "path",
              "primary",
              "primary_link",
              "secondary",
              "secondary_link",
              "tertiary",
              "tertiary_link",
              "track"
            ]
          }
        );
      };
    });
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
        {reticuleBounds && featureLoader != null && (
          <FeatureOverlay
            boundingBox={reticuleBounds}
            featureLoader={featureLoader}
          />
        )}
      </ReactMapGL>
    </div>
  );
}
