import { useRef, useEffect, useState, useReducer } from "react";
import React from "react";
import "./App.css";
import { stat } from "fs";

function App() {
  const requiredPoints = 100;
  const canvasRef = useRef();
  const [state, dispatch] = useReducer(
    (state, action) => {
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
            points
          };
        default:
          throw new Error();
      }
    },
    { points: [] }
  );

  useEffect(() => {
    console.log("Hola");

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { width, height } = canvas;

      dispatch({ type: "dimensionsKnown", dimensions: { width, height } });
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.strokeStyle = "black";
      context.beginPath();
      state.points.forEach(({ x, y, radius }) => {
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      });
      context.stroke();
    }
  }, [canvasRef, state]);

  return (
    <div className="App">
      <div>
        <canvas
          ref={canvasRef}
          width="400"
          height="400"
          style={{ border: "1px dashed black" }}
        ></canvas>
      </div>
      <input type="range"></input>
    </div>
  );
}

export default App;
