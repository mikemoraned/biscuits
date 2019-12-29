import React from "react";
import { useMemo } from "react";
import random from "random";
import seedrandom from "seedrandom";

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
    copyCtx.putImageData(imageData, 0, 0, box.x, box.y, box.width, box.height);
  });
  copyCtx.strokeStyle = "white";
  boxes.forEach(box => {
    copyCtx.beginPath();
    copyCtx.rect(box.x, box.y, box.width, box.height);
    copyCtx.stroke();
  });
}

const seed = "3";

function App() {
  const boxes = useMemo(() => {
    const rng = random.clone(seedrandom(seed));
    const boxes = [];
    let remaining = boxCount;
    while (remaining-- !== 0) {
      boxes.push({
        x: rng.int(0, width - boxWidth),
        y: rng.int(0, height - boxHeight),
        width: boxWidth,
        height: boxHeight,
        fill: `rgb(${rng.int(0, 255)}, ${rng.int(0, 255)}, ${rng.int(0, 255)})`
      });
    }
    boxes.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
    for (let index = 0; index < boxes.length; index++) {
      boxes[index].id = index + 1;
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
