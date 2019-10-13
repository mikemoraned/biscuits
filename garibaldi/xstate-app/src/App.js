import React from "react";
import "./App.css";
import { Machine, interpret } from "xstate";

const toggleMachine = Machine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } }
  }
});

const toggleService = interpret(toggleMachine)
  .onTransition(state => console.log(state.value))
  .start();

function App() {
  function toggle() {
    toggleService.send("TOGGLE");
  }

  return (
    <div className="App">
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

export default App;
