import React from "react";
import { useMemo } from "react";

const width = 400;
const height = 400;
const boxCount = 10;
const boxWidth = 30;
const boxHeight = 30;

function directDraw(ctx, boxes) {
  ctx.clearRect(0, 0, width, height);
  boxes.forEach(box => {
    ctx.fillStyle = box.fill;
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.fill();
  });
  ctx.fillStyle = "white";
  ctx.font = "20px Courier";
  boxes.forEach(box => {
    ctx.fillText(`${box.id}`, box.x + 5, box.y + box.height - 5);
  });
}

function copyDraw(directCtx, copyCtx, boxes) {
  copyCtx.clearRect(0, 0, width, height);
  copyCtx.fillStyle = "red";
  copyCtx.rect(0, 0, width, height);
  copyCtx.fill();
  const imageData = directCtx.getImageData(0, 0, width, height);
  boxes.forEach(box => {
    if (box.id === 1) {
      copyCtx.putImageData(
        imageData,
        box.x,
        box.y,
        box.x,
        box.y,
        box.width,
        box.height
      );
    }
  });
}

function App() {
  const boxes = useMemo(() => {
    const boxes = [];
    let remaining = boxCount;
    while (remaining-- !== 0) {
      boxes.push({
        x: Math.floor(Math.random() * (width - boxWidth)),
        y: Math.floor(Math.random() * (height - boxHeight)),
        width: boxWidth,
        height: boxHeight,
        fill: `rgb(${Math.random() * 255.0}, ${Math.random() *
          255.0}, ${Math.random() * 255.0})`,
        id: boxCount - remaining
      });
    }
    return boxes;
  }, []);

  const directCanvasRef = React.useRef(null);
  const copyCanvasRef = React.useRef(null);

  React.useEffect(() => {
    const directCanvas = directCanvasRef.current;
    const directCtx = directCanvas.getContext("2d");
    directDraw(directCtx, boxes);

    const copyCanvas = copyCanvasRef.current;
    const copyCtx = copyCanvas.getContext("2d");

    copyDraw(directCtx, copyCtx, boxes);
  });

  return (
    <>
      <canvas
        ref={directCanvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid red" }}
      />
      <canvas
        ref={copyCanvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid green" }}
      />
    </>
  );
}

export default App;
