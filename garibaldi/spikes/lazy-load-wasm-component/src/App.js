import React from "react";
import { Suspense } from "react";
import "./App.css";

function loaderFunction() {
  console.log("Before delay");
  return new Promise(resolve => setTimeout(resolve, 5 * 1000)).then(() => {
    console.log("After delay");
    return import("./VanillaComponent");
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
