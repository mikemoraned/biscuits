import React from "react";
import "./App.css";
import { Machine, interpret } from "xstate";
import { useService } from "@xstate/react";

const fetchMap = (context, event) => {
  console.log("fetching map...");
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      const random = Math.random();
      console.log(random);
      if (random > 0.5) {
        resolve();
      } else {
        reject();
      }
    }, 1000);
  });
};

const mapMachine = Machine({
  id: "map",
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: "fetchMap",
        src: fetchMap,
        onDone: {
          target: "interactive"
        },
        onError: {
          target: "loading_failed"
        }
      }
    },
    loading_failed: {
      on: {
        RETRY: "loading"
      }
    },
    interactive: {
      on: {
        RETRY: "loading"
      }
    }
  }
});

const mapService = interpret(mapMachine)
  .onTransition(state => console.log(state.value))
  .start();

function Reload() {
  const [current, send] = useService(mapService);

  return <button onClick={() => send("RETRY")}>Retry</button>;
}

function Map() {
  const [current, send] = useService(mapService);

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
