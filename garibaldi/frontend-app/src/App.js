import React from "react";
import { useMemo } from "react";
import "./App.scss";
import { CitySelector } from "./CitySelector";
import { CityView } from "./CityView";
import dotenv from "dotenv";

import { MapBoxContextProviderFromEnvironment } from "./MapBoxContext";
import { useService } from "@xstate/react";
import { service } from "./Machine";
import { lazyLoader } from "./BiscuitsOverlay";

dotenv.config();

function App() {
  // eslint-disable-next-line no-unused-vars
  const [current, send] = useService(service);
  const { cityService } = current.context;

  // eslint-disable-next-line no-unused-vars
  const _ = useMemo(() => lazyLoader(), []);

  return (
    <MapBoxContextProviderFromEnvironment>
      <div className="App container is-fluid">
        <div className="columns">
          <div className="column city-view">
            <>
              {cityService && <CityView service={cityService} />}
              <div
                style={{
                  position: "fixed",
                  top: "0px",
                  padding: "10px"
                }}
              >
                <CitySelector initiallyOpen={true} />
              </div>
            </>
          </div>
        </div>
      </div>
    </MapBoxContextProviderFromEnvironment>
  );
}

export default App;
