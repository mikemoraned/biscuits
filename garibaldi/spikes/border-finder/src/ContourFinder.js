import React from "react";

export default function ContourFinder({ circles, width, height }) {
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
