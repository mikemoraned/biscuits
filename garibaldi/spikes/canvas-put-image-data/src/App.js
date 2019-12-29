import React from "react";
import { useMemo } from "react";

const width = 400;
const height = 400;
const boxCount = 10;
const boxWidth = 30;
const boxHeight = 30;

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
          255.0}, ${Math.random() * 255.0})`
      });
    }
    return boxes;
  }, []);

  const directCanvasRef = React.useRef(null);
  const copyCanvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = directCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    boxes.forEach(box => {
      ctx.fillStyle = box.fill;
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.fill();
    });
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
