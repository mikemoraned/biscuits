import React from "react";
import "./App.scss";
import { CitySelector } from "./CitySelector";
import { CityView } from "./CityView";
import dotenv from "dotenv";

import { MapBoxContextProviderFromEnvironment } from "./MapBoxContext";
import { useService } from "@xstate/react";
import { service } from "./Machine";

dotenv.config();

function App() {
  // eslint-disable-next-line no-unused-vars
  const [current, send] = useService(service);
  const { cityService } = current.context;

  return (
    <MapBoxContextProviderFromEnvironment>
      <div className="App container is-fluid">
        <div className="columns">
          <div className="column is-one-quarter ">
            <CitySelector />
          </div>
          <div className="column city-view">
            {cityService && <CityView service={cityService} />}
          </div>
        </div>
      </div>
    </MapBoxContextProviderFromEnvironment>
  );
}

export default App;
