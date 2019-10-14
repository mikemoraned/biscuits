import { Machine, interpret } from "xstate";

const fetchMap = () => {
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

export const mapService = interpret(mapMachine).onTransition(state =>
  console.log(state.value)
);
