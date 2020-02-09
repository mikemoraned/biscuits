import React, { Component } from 'react';
import './App.css';
import MapComponent from "./MapComponent";

const mapStyles =
    [
        {
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#000000"
                }
            ]
        },
    ];

// const collapsedStyles = "style=element:labels|visibility:off&style=element:geometry.stroke|visibility:off&style=feature:landscape|element:geometry|saturation:-100&style=feature:water|saturation:-100|invert_lightness:true";
const collapsedStyles = "style=element:labels|visibility:off" +
    "&style=element:geometry|visibility:off" +
    "&style=element:geometry|feature:road|visibility:on|color:black";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="map dynamic">
          <MapComponent
          mapStyles={mapStyles}
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px`, width: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          />
        </div>
        <div className="map static">
            <img src={`https://maps.googleapis.com/maps/api/staticmap?center=-34.397,150.644&zoom=8&size=400x400&${collapsedStyles}`}/>
          </div>
      </div>
    );
  }
}

export default App;
