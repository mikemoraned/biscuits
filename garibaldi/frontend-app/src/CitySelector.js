import React from "react";
import { useService } from "@xstate/react";
import { CityItem } from "./CityItem";
import { service } from "./Machine";
import styles from "./CitySelector.module.scss";

function LoadingCityNames() {
  return (
    <select>
      <option>Loading cities</option>
    </select>
  );
}

function CityNames({ cities, selectedName }) {
  // eslint-disable-next-line no-unused-vars
  const [current, send] = useService(service);
  return (
    <select
      value={selectedName}
      onChange={e => {
        send("SELECT", { name: e.target.value });
      }}
    >
      <option disabled selected>
        Select city
      </option>
      <>
        {cities.map(({ name }) => {
          return (
            <option value={name} key={name}>
              {name}
            </option>
          );
        })}
      </>
    </select>
  );
}

function CityItems({ cities, send }) {
  return (
    <div className="is-hidden-mobile location-list">
      {cities.map(city => {
        return (
          <CityItem
            city={city}
            key={city.name}
            className={styles.item}
            loadCallback={() => {
              send("SELECT", { name: city.name });
            }}
          />
        );
      })}
    </div>
  );
}

export function CitySelector() {
  const [current, send] = useService(service);
  const loading = current.matches("loading");
  const { selectedName, cities } = current.context;

  return (
    <div className="columns location-selector">
      <div className="column">
        <div className={`select is-medium ${loading ? "is-loading" : ""}`}>
          {loading && <LoadingCityNames />}
          {!loading && (
            <CityNames cities={cities} selectedName={selectedName} />
          )}
        </div>
        {!loading && <CityItems cities={cities} send={send} />}
      </div>
    </div>
  );
}
