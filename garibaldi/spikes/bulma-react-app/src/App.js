import React from "react";
import { useRef, useLayoutEffect, useState } from "react";
import "./App.scss";
import dotenv from "dotenv";
import ReactMapGL from "react-map-gl";

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

const defaultZoom = 12;

function CityItem({ city }) {
  const mapboxApiAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const { latitude, longitude } = city.location;
  const zoom = defaultZoom;
  const mapStyle = "dark-v10";
  const url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${longitude},${latitude},${zoom},0.00,0.00/1280x960?access_token=${mapboxApiAccessToken}`;
  const { name } = city;
  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">{name}</p>
      </header>
      <div className="card-image">
        <figure className="image is-4by3">
          <img src={url} alt={`${name}`} />
        </figure>
      </div>
      <footer className="card-footer">
        <a href="#" className="card-footer-item">
          Load
        </a>
      </footer>
    </div>
  );
}

function CitySelector({ cities }) {
  return (
    <div className="columns location-selector">
      <div className="column">
        <div className="select is-medium">
          <select>
            {cities.map(({ name }) => {
              return (
                <option value={name} key={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="is-hidden-mobile location-list">
          {cities.map(city => {
            return <CityItem city={city} key={city.name} />;
          })}
        </div>
      </div>
    </div>
  );
}

function Map({ city }) {
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 400
  });

  useLayoutEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  }, [containerRef]);

  const { width, height } = containerDimensions;

  const [viewport, setViewport] = useState({
    zoom: defaultZoom,
    ...city.location
  });
  function viewportUpdated(viewport) {
    const { zoom, latitude, longitude } = viewport;
    setViewport({ zoom, latitude, longitude });
  }

  return (
    <div ref={containerRef} className="map">
      <ReactMapGL
        width={width}
        height={height}
        {...viewport}
        onViewportChange={viewportUpdated}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      />
    </div>
  );
}

function App() {
  return (
    <div className="App container is-fluid">
      <div className="columns">
        <div className="column is-one-quarter ">
          <CitySelector cities={cities} />
        </div>
        <div className="column">
          <Map city={cities[0]} />
        </div>
      </div>
    </div>
  );
}

export default App;
