import React from "react";
import "./App.scss";
import { MapView } from "./MapView";
import dotenv from "dotenv";

import { MapBoxContextProviderFromEnvironment } from "./MapBoxContext";

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
  { name: "Budapest", location: { latitude: 47.497913, longitude: 19.040236 } }
];

function App() {
  return (
    <MapBoxContextProviderFromEnvironment>
      <div>
        <MapView city={cities[0]} />
      </div>
    </MapBoxContextProviderFromEnvironment>
  );
}

export default App;
