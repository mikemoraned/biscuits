import React from "react";
import { useMemo } from "react";

const width = 500;
const height = 500;
const boxCount = 10;
const boxWidth = 30;
const boxHeight = 30;

function App() {
  const boxes = useMemo(() => {
    const boxes = [];
    let remaining = boxCount;
    while (remaining-- !== 0) {
      boxes.push({
        x: Math.random() * (width - boxWidth),
        y: Math.random() * (height - boxHeight),
        width: boxWidth,
        height: boxHeight
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
    ctx.fillStyle = "blue";
    ctx.beginPath();
    boxes.forEach(box => {
      ctx.rect(box.x, box.y, box.width, box.height);
    });
    ctx.fill();
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
