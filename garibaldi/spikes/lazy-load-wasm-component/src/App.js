import React from "react";
import { Suspense } from "react";
import "./App.css";

const VanillaComponent = React.lazy(() => import("./VanillaComponent"));

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
