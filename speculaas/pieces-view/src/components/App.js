import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Search">Search</div>
        <div className="Control">Control</div>
        <PlaceList placeIds={['edinburgh', 'jerusalem']}/>
      </div>
    );
  }
}

export default App;
