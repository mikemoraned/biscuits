import React from "react";
import { useMemo } from "react";
import random from "random";
import seedrandom from "seedrandom";

const width = 400;
const height = 400;
const circleCount = 10;
const circleRadius = 40;

function directDraw(ctx, circleRadius) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  circleRadius.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  });
}

const seed = "1";

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

  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    directDraw(ctx, circles);
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid red" }}
      />
    </>
  );
}

export default App;
