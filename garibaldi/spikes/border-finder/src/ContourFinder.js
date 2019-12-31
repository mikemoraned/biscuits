import React from "react";

export function lazyLoader() {
  console.time("biscuiting");
  return Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ]).then(([biscuiting_lib, biscuiting_lib_bg]) => {
    console.timeEnd("biscuiting");
    return bindContourFinder({
      biscuiting_lib,
      biscuiting_lib_bg
    });
  });
}

function bindContourFinder({ biscuiting_lib, biscuiting_lib_bg }) {
  const { BiscuitFinder } = biscuiting_lib;
  const ContourFinder = ({ circles, width, height }) => {
    console.time("creating biscuitFinder");
    BiscuitFinder.new();
    console.timeEnd("creating biscuitFinder");

    const canvasRef = React.useRef(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      directDraw(ctx, circles, width, height);
    });

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid red" }}
      />
    );
  };
  return { default: ContourFinder };
}

function directDraw(ctx, circles, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  });
}
