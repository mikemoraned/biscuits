import React, { useRef, useState, useEffect } from "react";

class BiscuitFinderLayer {
  constructor({ width, height, biscuitFinder, memory }) {
    this.width = width;
    this.height = height;
    this.biscuitFinder = biscuitFinder;
    this.memory = memory;
  }

  draw(context) {
    console.time("BiscuitFinderLayer.draw");
    const inputImageData = context.getImageData(0, 0, this.width, this.height);
    console.time("find biscuits");
    console.dir(this.biscuitFinder.find_biscuits(inputImageData.data));
    console.timeEnd("find biscuits");

    console.time("draw image");
    const outputPointer = this.biscuitFinder.output();
    const outputArray = new Uint8ClampedArray(
      this.memory.buffer,
      outputPointer,
      4 * this.width * this.height
    );

    const outputImageData = new ImageData(outputArray, this.width, this.height);

    context.putImageData(outputImageData, 0, 0);
    console.timeEnd("draw image");
    console.timeEnd("BiscuitFinderLayer.draw");
  }
}

function loadBiscuitFinderLayer({ width, height, setBiscuitFinderLayer }) {
  console.time("loadBiscuitFinderLayer");
  Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ])
    .then(([biscuiting, biscuiting_bg]) => {
      const { BiscuitFinder } = biscuiting;
      const { memory } = biscuiting_bg;
      const biscuitFinder = BiscuitFinder.new(width, height);

      setBiscuitFinderLayer(
        new BiscuitFinderLayer({ width, height, biscuitFinder, memory })
      );
      console.timeEnd("loadBiscuitFinderLayer");
    })
    .catch(err => {
      console.log(err);
    });
}

function App() {
  const canvasRef = useRef(null);
  const [biscuitFinderLayer, setBiscuitFinderLayer] = useState(null);
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    if (biscuitFinderLayer == null && canvasRef.current != null) {
      const canvas = canvasRef.current;
      const { width, height } = canvas;

      loadBiscuitFinderLayer({ width, height, setBiscuitFinderLayer });
    }
  }, [canvasRef, biscuitFinderLayer]);

  useEffect(() => {
    if (canvasRef.current != null && circles.length > 0) {
      const canvas = canvasRef.current;
      const { width, height } = canvas;
      const context = canvas.getContext("2d");
      context.fillStyle = "white";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "black";
      circles.forEach(({ x, y, radius }) => {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
      });

      if (biscuitFinderLayer != null) {
        biscuitFinderLayer.draw(context);
      }
    }
  }, [circles, canvasRef, biscuitFinderLayer]);

  const handleClick = event => {
    const circle = { x: event.clientX, y: event.clientY, radius: 50 };
    setCircles(circles.concat([circle]));
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={handleClick}
    />
  );
}

export default App;
