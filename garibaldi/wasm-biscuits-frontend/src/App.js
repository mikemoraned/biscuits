import React, { useRef } from "react";

function App() {
  const canvasRef = useRef(null);

  const handleClick = () => {
    import("@mike_moran/biscuiting-lib")
      .then(biscuiting => {
        const dataURL = canvasRef.current.toDataURL();
        biscuiting.find_biscuits(dataURL);
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
