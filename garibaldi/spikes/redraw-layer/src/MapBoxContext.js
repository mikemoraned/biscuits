import React from "react";

const defaults = {
  access_token: null,
  default_zoom: 12
};
export const MapBoxContext = React.createContext(defaults);

export function MapBoxContextProviderFromEnvironment({ children }) {
  const access_token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  return (
    <MapBoxContext.Provider value={{ ...defaults, access_token }}>
      {children}
    </MapBoxContext.Provider>
  );
}
