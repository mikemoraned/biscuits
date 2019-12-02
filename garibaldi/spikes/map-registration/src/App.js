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
  { name: "London", location: { latitude: 51.507351, longitude: -0.127758 } }
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
