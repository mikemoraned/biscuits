import React from "react";
import { Suspense } from "react";
import "./App.css";
import { lazyLoader } from "./BiscuitingComponent";

const BiscuitingComponent = React.lazy(lazyLoader);

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BiscuitingComponent hello={"Woop Woop"} />
      </Suspense>
    </div>
  );
}

export default App;
