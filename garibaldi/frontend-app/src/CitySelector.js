import React from "react";
import { useState } from "react";
import { useService } from "@xstate/react";
import { service } from "./Machine";

function useToggle(initialValue) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue(!value);
  }

  return [value, toggle];
}

export function CitySelector({ initiallyOpen }) {
  const [current, send] = useService(service);
  const { cities } = current.context;

  const [active, toggleActive] = useToggle(initiallyOpen);
  return (
    <div className={`dropdown ${active ? "is-active" : ""}`}>
      <div className="dropdown-trigger">
        <button
          className={`button ${cities.length === 0 ? "is-loading" : ""}`}
          onClick={toggleActive}
        >
          <span>Select City</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        {cities.length > 0 && (
          <div
            className="dropdown-content"
            style={{ maxHeight: "12.1em", overflow: "auto" }}
          >
            {cities.map(city => {
              function onClick() {
                toggleActive();
                send("SELECT", { name: city.name });
              }
              return (
                <button
                  className="button dropdown-item"
                  onClick={onClick}
                  key={city.name}
                >
                  <span>{city.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
