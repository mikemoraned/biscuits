import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback
} from "react";
import "./App.css";
import ReactMapGL from "react-map-gl";
import dotenv from "dotenv";

dotenv.config();

function geoJSONPoint({ latitude, longitude }) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    properties: {
      name: "Hello World"
    }
  };
}

function Map() {
  const [viewport, setViewport] = useState({
    width: "100vh",
    height: "100vh",
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  const [center, setCenter] = useState({
    latitude: viewport.latitude,
    longitude: viewport.longitude
  });

  const containerRef = useRef();
  const [containerDimensions, setContainerDimensions] = useState({});
  const resizeHandler = useCallback(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  }, [containerRef]);
  useLayoutEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });

    let resizeObserver = new ResizeObserver(() => resizeHandler());
    resizeObserver.observe(containerRef.current);
  }, [containerRef, resizeHandler]);

  const mapRef = useRef();

  function onLoad() {
    const map = mapRef.current.getMap();
    console.log("defining layer");
    map.addSource("point", { type: "geojson", data: null });
    map.addLayer({
      id: "point",
      type: "circle",
      source: "point"
    });
    setCenter({
      latitude: viewport.latitude,
      longitude: viewport.longitude
    });
  }

  function viewportUpdated(viewport) {
    setViewport(viewport);
    setCenter({
      latitude: viewport.latitude,
      longitude: viewport.longitude
    });
  }

  useEffect(() => {
    const map = mapRef.current.getMap();
    if (map) {
      const source = map.getSource("point");
      if (source) {
        source.setData(geoJSONPoint(center));
      }
    }
  }, [mapRef, center]);

  return (
    <div ref={containerRef} className="fullscreen">
      <ReactMapGL
        ref={mapRef}
        {...viewport}
        {...containerDimensions}
        onViewportChange={viewportUpdated}
        onLoad={onLoad}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      />
    </div>
  );
}

function App() {
  return (
    <div className="App fullscreen">
      <Map />
    </div>
  );
}

export default App;
