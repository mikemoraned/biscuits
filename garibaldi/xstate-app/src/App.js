/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }]*/

import { useState } from "react";
import React from "react";
import "./App.css";
import { mapService } from "./MapService";
import { useService } from "@xstate/react";
import ReactMapGL from "react-map-gl";

function Reload() {
  const [_, send] = useService(mapService);

  return <button onClick={() => send("RETRY")}>Retry</button>;
}

function Loading() {
  return <div>Loading</div>;
}

function LoadingFailed() {
  return (
    <>
      <div>Loading failed</div>
      <Reload />
    </>
  );
}

function InteractiveMap() {
  const [viewport, setViewport] = useState({
    width: "100vh",
    height: "100vh",
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  function viewportUpdated(viewport) {
    setViewport(viewport);
  }

  return (
    <>
      <ReactMapGL
        {...viewport}
        onViewportChange={viewportUpdated}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      />
    </>
  );
}

function App() {
  const [current] = useService(mapService);

  if (current.matches("loading")) {
    return (
      <div className="App">
        <Loading />
      </div>
    );
  } else if (current.matches("loading_failed")) {
    return (
      <div className="App">
        <LoadingFailed />
      </div>
    );
  } else if (current.matches("interactive")) {
    return (
      <div className="App">
        <InteractiveMap />
      </div>
    );
  } else {
    return <div></div>;
  }
}

export default App;
