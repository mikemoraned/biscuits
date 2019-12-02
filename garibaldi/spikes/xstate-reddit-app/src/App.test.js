import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { interpret } from "xstate";

import { createSubredditMachine } from "./Machine";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("should load posts of a selected subreddit", done => {
  const machine = createSubredditMachine("reactjs");
  const redditService = interpret(machine).onTransition(state => {
    if (state.matches("loaded")) {
      expect(state.context.posts.length).toBeGreaterThan(0);

      done();
    }
  });

  redditService.start();
});
