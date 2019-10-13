import React from "react";
import "./App.css";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

const toggleMachine = Machine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } }
  }
});

function App() {
  const [current, send] = useMachine(toggleMachine);

  function toggle() {
    send("TOGGLE");
  }

  return (
    <div className="App">
      <button onClick={toggle}>
        {current.matches("inactive") ? "Off" : "On"}
      </button>
    </div>
  );
}

export default App;
