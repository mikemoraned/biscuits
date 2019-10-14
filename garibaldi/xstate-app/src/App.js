/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }]*/

import React from "react";
import "./App.css";
import { mapService } from "./MapService";
import { useService } from "@xstate/react";

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
  return (
    <>
      <div>Interactive</div>
      <Reload />
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
