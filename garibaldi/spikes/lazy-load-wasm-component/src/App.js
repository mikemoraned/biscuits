import React from "react";
import { Suspense } from "react";
import "./App.css";

function loaderFunction() {
  console.time("biscuiting");
  return Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ]).then(([biscuiting_lib, biscuiting_lib_bg]) => {
    console.timeEnd("biscuiting");
    console.time("import");
    return import("./BiscuitingComponent").then(
      ({ bindBiscuitingComponent }) => {
        console.timeEnd("import");
        console.time("binding");
        const BiscuitingComponent = bindBiscuitingComponent({
          biscuiting_lib,
          biscuiting_lib_bg
        });
        console.timeEnd("binding");
        return { default: BiscuitingComponent };
      }
    );
  });
}

const BiscuitingComponent = React.lazy(loaderFunction);

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BiscuitingComponent />
      </Suspense>
    </div>
  );
}

export default App;
