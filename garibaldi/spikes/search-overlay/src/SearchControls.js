import React from "react";
import { useState } from "react";

function useToggle(initialValue) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue(!value);
  }

  return [value, toggle];
}

export default function SearchControls({ cities, initiallyOpen }) {
  const [active, toggleActive] = useToggle(initiallyOpen);
  return (
    <div className={`dropdown ${active ? "is-active" : ""}`}>
      <div className="dropdown-trigger">
        <button
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={toggleActive}
        >
          <span>Select City</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div
          className="dropdown-content"
          style={{ maxHeight: "12.1em", overflow: "auto" }}
        >
          {cities.map(city => {
            function onClick() {
              toggleActive();
            }
            return (
              <a href="#" className="dropdown-item" onClick={onClick}>
                {city.name}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
