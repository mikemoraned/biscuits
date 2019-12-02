import { useRef, useEffect, useReducer, useState } from "react";
import React from "react";
import "./App.css";

function TestCanvas({ scale }) {
  const requiredPoints = 200;
  const canvasRef = useRef();
  const [state, dispatch] = useReducer(
    (state, action) => {
      console.dir(action);
      switch (action.type) {
        case "dimensionsKnown":
          const { width, height } = action.dimensions;
          var points = [];
          [...Array(requiredPoints)].forEach(() => {
            points.push({
              x: Math.random() * width,
              y: Math.random() * height,
              radius: 10
            });
          });
          return {
            dimensions: action.dimensions,
            points
          };
        default:
          throw new Error();
      }
    },
    {
      dimensions: null,
      points: []
    }
  );

  useEffect(() => {
    console.log("Hola");

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { width, height } = canvas.getBoundingClientRect();

      dispatch({ type: "dimensionsKnown", dimensions: { width, height } });
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasRef.current && state.dimensions && state.points) {
      const canvas = canvasRef.current;
      const { width, height } = state.dimensions;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const context = canvas.getContext("2d");
      context.scale(scale, scale);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "black";
      context.beginPath();
      state.points.forEach(({ x, y, radius }) => {
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      });
      context.stroke();
    }
  }, [canvasRef, state, scale]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="400"
        height="400"
        style={{ border: "1px dashed black" }}
      ></canvas>
    </div>
  );
}

function App() {
  const defaultScale = window.devicePixelRatio || 1.0;
  const [scale, setScale] = useState(defaultScale);
  const minScale = 0.1;
  const maxScale = defaultScale * 2.0;
  const scaleStep = 0.1;

  function handleScaleChange(event) {
    setScale(event.target.value);
    console.log(scale);
  }

  return (
    <div className="App">
      <TestCanvas scale={scale} />
      <input
        type="range"
        min={minScale}
        step={scaleStep}
        max={maxScale}
        value={scale}
        onChange={handleScaleChange}
      ></input>
    </div>
  );
}

export default App;
