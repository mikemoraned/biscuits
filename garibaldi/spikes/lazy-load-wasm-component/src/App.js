import React from "react";
import { Suspense } from "react";
import "./App.css";

function loaderFunction() {
  console.time("import");
  return import("./VanillaComponent").then(({ binding }) => {
    console.timeEnd("import");
    console.time("binding");
    const now = new Date();
    const Component = binding(now);
    console.timeEnd("binding");
    return { default: Component };
  });
}

const VanillaComponent = React.lazy(loaderFunction);

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <VanillaComponent />
      </Suspense>
    </div>
  );
}

export default App;
