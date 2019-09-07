import React from "react";

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

  return (
    <div>
      <button onClick={handleClick}>Load</button>
    </div>
  );
}

export default App;
