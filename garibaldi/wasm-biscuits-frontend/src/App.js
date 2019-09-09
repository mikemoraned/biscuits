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

  useEffect(() => {
    if (biscuitFinderLayer == null && canvasRef.current != null) {
      const canvas = canvasRef.current;
      const { width, height } = canvas;

      loadBiscuitFinderLayer({ width, height, setBiscuitFinderLayer });
    }
  }, [canvasRef, biscuitFinderLayer]);

  const handleClick = () => {
    if (biscuitFinderLayer != null) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      biscuitFinderLayer.draw(context);
    }
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
