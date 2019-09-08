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
        console.dir(outputPointer);
        const outputArray = new Uint8ClampedArray(
          memory.buffer,
          outputPointer,
          4 * width * height
        );

        const outputImageData = new ImageData(outputArray, width, height);

        context.putImageData(outputImageData, 0, 0);
        console.timeEnd("draw image");

        // const dataURL = canvas.toDataURL();
        // console.time("find biscuits");
        // const result = biscuiting.find_biscuits(dataURL);
        // console.timeEnd("find biscuits");

        // const image = new Image();
        // image.onload = () => {
        //   console.timeEnd("load image");
        //   console.time("draw image");
        //   context.drawImage(image, 0, 0);
        //   console.timeEnd("draw image");
        // };
        // console.time("load image");
        // image.src = result;
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
