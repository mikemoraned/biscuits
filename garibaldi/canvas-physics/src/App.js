import React from "react";
import { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

function loadBallPhysicsSimulation({ setSimulation }) {
  console.time("loadBallPhysicsSimulation");
  Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ])
    .then(([biscuiting, biscuiting_bg]) => {
      const { BallPhysicsSimulation } = biscuiting;
      const { memory } = biscuiting_bg;
      const simulation = BallPhysicsSimulation.new();

      console.timeEnd("loadBallPhysicsSimulation");
    })
    .catch(err => {
      console.log(err);
    });
}

function App() {
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    if (simulation == null) {
      loadBallPhysicsSimulation({ setSimulation });
    }
  }, [simulation]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
