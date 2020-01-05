import React from "react";

import { MapBoxContext } from "./MapBoxContext";
import { useRef, useLayoutEffect, useState, useContext } from "react";
import ReactMapGL from "react-map-gl";

export default function MapView({ city }) {
  const mapbox = useContext(MapBoxContext);

  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 800
  });

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

  return (
    <div ref={containerRef} className="map">
      <ReactMapGL
        width={width}
        height={height}
        {...viewport}
        onViewportChange={viewportUpdated}
        mapboxApiAccessToken={mapbox.access_token}
      ></ReactMapGL>
    </div>
  );
}
