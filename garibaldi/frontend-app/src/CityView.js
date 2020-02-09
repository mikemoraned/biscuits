import React from "react";
import { useService } from "@xstate/react";
import { MapView } from "./MapView";

export function CityView({ service }) {
  // eslint-disable-next-line no-unused-vars
  const [current, send] = useService(service);
  const { name, city } = current.context;

  if (city) {
    return <MapView city={city} />;
  } else {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Loading {name}
      </div>
    );
  }
}
