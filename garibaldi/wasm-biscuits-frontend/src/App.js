import React, { useRef } from "react";

function App() {
  const handleClick = () => {
    import("@mike_moran/biscuiting-lib")
      .then(biscuiting => {
        console.dir(biscuiting);
        biscuiting.greet("foop");
      })
      .catch(err => {
        console.log(err);
      });
  };

  const canvasRef = useRef(null);

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
