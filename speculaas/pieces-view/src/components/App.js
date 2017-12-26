import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";

class App extends Component {
  render() {
    return (
      <div className="App">
        <PlaceList placeIds={['edinburgh', 'jerusalem']}/>
      </div>
    );
  }
}

export default App;
