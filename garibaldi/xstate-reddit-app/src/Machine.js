import { Machine, assign, spawn } from "xstate";

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
    subreddits: {},
    subreddit: null
  },
  states: {
    idle: {},
    selected: {} // no invocations!
  },
  on: {
    SELECT: {
      target: ".selected",
      actions: assign((context, event) => {
        // Use the existing subreddit actor if one doesn't exist
        let subreddit = context.subreddits[event.name];

        if (subreddit) {
          return {
            ...context,
            subreddit
          };
        }

        // Otherwise, spawn a new subreddit actor and
        // save it in the subreddits object
        subreddit = spawn(createSubredditMachine(event.name));

        return {
          subreddits: {
            ...context.subreddits,
            [event.name]: subreddit
          },
          subreddit
        };
      })
    }
  }
});

export const createSubredditMachine = subreddit => {
  return Machine({
    id: "subreddit",
    initial: "loading",
    context: {
      subreddit, // subreddit name passed in
      posts: null,
      lastUpdated: null
    },
    states: {
      loading: {
        invoke: {
          id: "fetch-subreddit",
          src: invokeFetchSubreddit,
          onDone: {
            target: "loaded",
            actions: assign({
              posts: (_, event) => event.data,
              lastUpdated: () => Date.now()
            })
          }
        }
      },
      loaded: {
        on: {
          REFRESH: "loading"
        }
      },
      failure: {
        on: {
          RETRY: "loading"
        }
      }
    }
  });
};
