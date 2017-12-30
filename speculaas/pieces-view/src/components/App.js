import React, { Component } from 'react';
import '../styles/App.css';
import PlaceList from "./PlaceList";

class App extends Component {
  render() {
    return (
      <div className="App">
        <PlaceList placeIds={['edinburgh', 'jerusalem', 'au', 'newyork', 'budapest']}/>
        {/*<PlaceList placeIds={['edinburgh']}/>*/}
        {/*<PlaceList placeIds={['edinburgh','budapest']}/>*/}
      </div>
    );
  }
}

export default App;
