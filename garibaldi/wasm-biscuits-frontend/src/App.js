import React, { useRef } from "react";

function App() {
  const canvasRef = useRef(null);

  const handleClick = () => {
    import("@mike_moran/biscuiting-lib")
      .then(biscuiting => {
        const dataURL = canvasRef.current.toDataURL();
        const result = biscuiting.find_biscuits(dataURL);
        console.dir(result);
        const context = canvasRef.current.getContext("2d");
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0);
        };
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
