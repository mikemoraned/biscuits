import React, { useRef } from "react";

function App() {
  const canvasRef = useRef(null);

  const handleClick = () => {
    Promise.all([
      import("@mike_moran/biscuiting-lib"),
      import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
    ])
      .then(([biscuiting, biscuiting_bg]) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const { width, height } = canvas;
        const { BiscuitFinder } = biscuiting;
        const { memory } = biscuiting_bg;
        const biscuitFinder = BiscuitFinder.new(width, height);

        const inputImageData = context.getImageData(0, 0, width, height);
        console.time("find biscuits");
        console.dir(biscuitFinder.find_biscuits(inputImageData.data));
        console.timeEnd("find biscuits");

        console.time("draw image");
        const outputPointer = biscuitFinder.output();
        const outputArray = new Uint8ClampedArray(
          memory.buffer,
          outputPointer,
          4 * width * height
        );

        const outputImageData = new ImageData(outputArray, width, height);

        context.putImageData(outputImageData, 0, 0);
        console.timeEnd("draw image");
      })
      .catch(err => {
        console.log(err);
      });
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
