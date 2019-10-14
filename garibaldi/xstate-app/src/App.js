/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }]*/

import React from "react";
import "./App.css";
import { mapService } from "./MapMachine";
import { useService } from "@xstate/react";

function Reload() {
  const [_, send] = useService(mapService);

  return <button onClick={() => send("RETRY")}>Retry</button>;
}

function Map() {
  const [current] = useService(mapService);

  if (current.matches("loading")) {
    return <div>Loading</div>;
  } else if (current.matches("loading_failed")) {
    return (
      <div>
        <div>Loading failed</div>
        <Reload />
      </div>
    );
  } else if (current.matches("interactive")) {
    return (
      <div>
        <div>Interactive</div>
        <Reload />
      </div>
    );
  } else {
    return <div></div>;
  }
}

function App() {
  return (
    <div className="App">
      <Map />
    </div>
  );
}

export default App;
