import React from "react";
import "./App.css";
import { useMachine, useService } from "@xstate/react";
import { redditMachine } from "./Machine";

const subreddits = ["frontend", "reactjs", "vuejs"];

const Subreddit = ({ service }) => {
  const [current, send] = useService(service);

  if (current.matches("failure")) {
    return (
      <div>
        Failed to load posts.{" "}
        <button onClick={_ => send("RETRY")}>Retry?</button>
      </div>
    );
  }

  const { subreddit, posts, lastUpdated } = current.context;

  return (
    <section
      data-machine={service.machine.id}
      data-state={current.toStrings().join(" ")}
    >
      {current.matches("loading") && <div>Loading posts...</div>}
      {posts && (
        <>
          <header>
            <h2>{subreddit}</h2>
            <small>
              Last updated: {lastUpdated}{" "}
              <button onClick={_ => send("REFRESH")}>Refresh</button>
            </small>
          </header>
          <ul>
            {posts.map(post => {
              return <li key={post.id}>{post.title}</li>;
            })}
          </ul>
        </>
      )}
    </section>
  );
};

const App = () => {
  const [current, send] = useMachine(redditMachine);
  const { subreddit } = current.context;

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
      {subreddit && <Subreddit service={subreddit} key={subreddit.id} />}
    </main>
  );
};

export default App;
