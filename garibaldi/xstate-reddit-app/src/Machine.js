import { Machine, assign } from "xstate";

function invokeFetchSubreddit(context) {
  const { subreddit } = context;

  return fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json => json.data.children.map(child => child.data));
}

export const redditMachine = Machine({
  id: "reddit",
  initial: "idle",
  context: {
    subreddit: null,
    posts: null
  },
  states: {
    idle: {},
    selected: {
      initial: "loading",
      states: {
        loading: {
          invoke: {
            id: "fetch-subreddit",
            src: invokeFetchSubreddit,
            onDone: {
              target: "loaded",
              actions: assign({
                posts: (context, event) => event.data
              })
            },
            onError: "failed"
          }
        },
        loaded: {},
        failed: {}
      }
    }
  },
  on: {
    SELECT: {
      target: ".selected",
      actions: assign({
        subreddit: (context, event) => event.name
      })
    }
  }
});

// sample SELECT event
const selectEvent = {
  type: "SELECT", // event type
  name: "reactjs" // subreddit name
};
