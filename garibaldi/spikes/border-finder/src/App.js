import React from "react";
import { useMemo, Suspense } from "react";
import random from "random";
import seedrandom from "seedrandom";
import { lazyLoader } from "./ContourFinder";

const width = 400;
const height = 400;
const circleCount = 10;
const circleRadius = 40;

const seed = "1";

const ContourFinder = React.lazy(lazyLoader);

function App() {
  const circles = useMemo(() => {
    const rng = random.clone(seedrandom(seed));
    const circles = [];
    let remaining = circleCount;
    while (remaining-- !== 0) {
      circles.push({
        x: rng.int(circleRadius, width - circleRadius),
        y: rng.int(circleRadius, height - circleRadius),
        radius: circleRadius
      });
    }

    return circles;
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContourFinder circles={circles} width={width} height={height} />
    </Suspense>
  );
}

export default App;
