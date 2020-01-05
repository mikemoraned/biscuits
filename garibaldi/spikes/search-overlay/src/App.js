import React from "react";
import dotenv from "dotenv";

import { MapBoxContextProviderFromEnvironment } from "./MapBoxContext";
import MapView from "./MapView";
import SearchControls from "./SearchControls";

dotenv.config();

const cities = [
  {
    name: "San Francisco",
    location: { latitude: 37.774929, longitude: -122.419418 }
  },
  {
    name: "Jerusalem",
    location: { latitude: 31.768318, longitude: 35.213711 }
  },
  { name: "Berlin", location: { latitude: 52.520008, longitude: 13.404954 } },
  { name: "London", location: { latitude: 51.507351, longitude: -0.127758 } },
  {
    name: "Edinburgh",
    location: { latitude: 55.953251, longitude: -3.188267 }
  },
  { name: "New York", location: { latitude: 40.73061, longitude: -73.935242 } },
  { name: "Budapest", location: { latitude: 47.497913, longitude: 19.040236 } },
  { name: "Ronneburg", location: { latitude: 50.8634, longitude: 12.18666 } },
  { name: "Jena", location: { latitude: 50.92878, longitude: 11.5899 } },
  { name: "Leipzig", location: { latitude: 51.343479, longitude: 12.387772 } },
  { name: "Barcelona", location: { latitude: 41.390205, longitude: 2.154007 } },
  { name: "Paris", location: { latitude: 48.864716, longitude: 2.349014 } },
  { name: "Vienna", location: { latitude: 48.210033, longitude: 16.363449 } },
  { name: "Moscow", location: { latitude: 55.751244, longitude: 37.618423 } },
  { name: "Amsterdam", location: { latitude: 52.379189, longitude: 4.899431 } },
  { name: "Frankfurt", location: { latitude: 50.110924, longitude: 8.682127 } },
  { name: "Beijing", location: { latitude: 39.913818, longitude: 116.363625 } },
  { name: "Singapore", location: { latitude: 1.29027, longitude: 103.851959 } },
  { name: "Melbourne", location: { latitude: -37.814, longitude: 144.96332 } }
];

function App() {
  return (
    <MapBoxContextProviderFromEnvironment>
      <>
        <MapView city={cities[0]}></MapView>
        <div
          style={{
            position: "fixed",
            top: "0px",
            padding: "10px",
            border: "1px dashed red"
          }}
        >
          <SearchControls cities={cities} initiallyOpen={true}></SearchControls>
        </div>
      </>
    </MapBoxContextProviderFromEnvironment>
  );
}

export default App;
