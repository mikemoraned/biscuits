import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import "./App.css";
import ReactMapGL from "react-map-gl";
import dotenv from "dotenv";

dotenv.config();

function Map() {
  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  const containerRef = useRef();
  const [containerDimensions, setContainerDimensions] = useState({});
  const resizeHandler = useCallback(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  }, [containerRef]);
  useLayoutEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });

    let resizeObserver = new ResizeObserver(() => resizeHandler());
    resizeObserver.observe(containerRef.current);
  }, [containerRef, resizeHandler]);

  return (
    <div ref={containerRef} className="fullscreen">
      <ReactMapGL
        {...viewport}
        {...containerDimensions}
        onViewportChange={viewport => setViewport(viewport)}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      />
    </div>
  );
}

function App() {
  return (
    <div className="App fullscreen">
      <Map />
    </div>
  );
}

export default App;
