import React from "react";

export function lazyLoader() {
  console.time("load biscuiting-lib");
  return Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ]).then(([biscuiting_lib, biscuiting_lib_bg]) => {
    console.timeEnd("load biscuiting-lib");
    return bindContourDisplay({
      biscuiting_lib,
      biscuiting_lib_bg
    });
  });
}

function bindContourDisplay({ biscuiting_lib, biscuiting_lib_bg }) {
  const { ContourFinder } = biscuiting_lib;
  const { memory } = biscuiting_lib_bg;
  const ContourDisplay = ({ circles, width, height }) => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawCircles(ctx, circles, width, height);

      const contourFinder = ContourFinder.new();
      const imageData = ctx.getImageData(0, 0, width, height);
      const result = contourFinder.find(width, height, imageData.data);
      console.log(result);

      const numContourPoints = contourFinder.num_contour_points();

      const contourPointer = contourFinder.contour_ptr();
      const pointArray = new Uint32Array(
        memory.buffer,
        contourPointer,
        2 * numContourPoints
      );
      console.log(pointArray);
      drawContour(ctx, pointArray);
    });

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid green" }}
      />
    );
  };
  return { default: ContourDisplay };
}

function drawContour(ctx, pointArray) {
  const startX = pointArray[0];
  const startY = pointArray[1];
  ctx.moveTo(startX, startY);
  ctx.beginPath();
  ctx.strokeStyle = "red";
  for (let index = 2; index < pointArray.length; index += 2) {
    const x = pointArray[index];
    const y = pointArray[index + 1];
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawCircles(ctx, circles, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fill();

  ctx.fillStyle = "white";
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  });
}
