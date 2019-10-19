import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { interpret } from "xstate";

import { redditMachine } from "./Machine";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("should load posts of a selected subreddit", done => {
  const redditService = interpret(redditMachine)
    .onTransition(state => {
      // when the state finally reaches 'selected.loaded',
      // the test has succeeded.

      if (state.matches({ selected: "loaded" })) {
        expect(state.context.posts.length).toBeGreaterThan(0);

        done();
      }
    })
    .start(); // remember to start the service!

  // Test that when the 'SELECT' event is sent, the machine eventually
  // reaches the { selected: 'loaded' } state with posts
  redditService.send("SELECT", { name: "reactjs" });
});
