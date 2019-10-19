import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useMachine } from "@xstate/react";
import { redditMachine } from "./Machine";

const subreddits = ["frontend", "reactjs", "vuejs"];

const App = () => {
  const [current, send] = useMachine(redditMachine);
  const { subreddit, posts } = current.context;

  return (
    <main>
      <header>
        <select
          onChange={e => {
            send("SELECT", { name: e.target.value });
          }}
        >
          {subreddits.map(subreddit => {
            return <option key={subreddit}>{subreddit}</option>;
          })}
        </select>
      </header>
      <section>
        <h1>{current.matches("idle") ? "Select a subreddit" : subreddit}</h1>
        {current.matches({ selected: "loading" }) && <div>Loading...</div>}
        {current.matches({ selected: "loaded" }) && (
          <ul>
            {posts.map(post => (
              <li key={post.title}>{post.title}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default App;
