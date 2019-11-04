import React from "react";
import { useContext } from "react";
import { MapBoxContext } from "./MapBoxContext";

export function CityItem({ city, className, loadCallback }) {
  const mapbox = useContext(MapBoxContext);
  const { latitude, longitude } = city.location;
  const zoom = mapbox.default_zoom;
  const mapStyle = "dark-v10";
  const url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${longitude},${latitude},${zoom},0.00,0.00/1280x960?access_token=${mapbox.access_token}`;
  const { name } = city;
  return (
    <div className={`card ${className}`}>
      <header className="card-header">
        <p className="card-header-title">{name}</p>
      </header>
      <div className="card-image">
        <figure className="image is-4by3">
          <img src={url} alt={`${name}`} onClick={loadCallback} />
        </figure>
      </div>
      <footer className="card-footer">
        <div className="card-footer-item">
          <button
            className="button is-primary is-fullwidth"
            onClick={loadCallback}
          >
            Load
          </button>
        </div>
      </footer>
    </div>
  );
}
