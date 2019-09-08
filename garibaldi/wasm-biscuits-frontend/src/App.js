import React, { useRef } from "react";

function App() {
  const canvasRef = useRef(null);

  const handleClick = () => {
    import("@mike_moran/biscuiting-lib")
      .then(biscuiting => {
        const dataURL = canvasRef.current.toDataURL();
        console.time("find biscuits");
        const result = biscuiting.find_biscuits(dataURL);
        console.timeEnd("find biscuits");
        const context = canvasRef.current.getContext("2d");
        const image = new Image();
        image.onload = () => {
          console.timeEnd("load image");
          console.time("draw image");
          context.drawImage(image, 0, 0);
          console.timeEnd("draw image");
        };
        console.time("load image");
        image.src = result;
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
