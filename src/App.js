import React, { Component } from 'react';
import './App.css';
import 'isomorphic-fetch';
import CanvasConnectedComponents from './CanvasConnectedComponents';

class App extends Component {
  render() {
      const names = ["edinburgh", "budapest", "jerusalem",  "newyork", "au" ];
      // const names = ["edinburgh", "budapest", "jerusalem" ];
      // const names = ["budapest"];
      // const names = ["edinburgh"];
      // const names = ["jerusalem"];
      // const names = ["newyork"];
      // const names = ["budapest", "jerusalem" ];
      return (
          <div className="App">
              <b>Instructions: Zoom out to see, click on shapes / city to animate</b>
              { names.map((name) => (
                  <div key={name}>
                      <h1>{name}</h1>
                      <CanvasConnectedComponents name={name} />
                  </div>
              ))}
          </div>
      );
  }
}

export default App;
