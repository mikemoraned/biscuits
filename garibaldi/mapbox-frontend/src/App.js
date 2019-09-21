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
import { geoMercator, geoPath } from "d3-geo";

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

  const mapContainerRef = useRef();
  const [containerDimensions, setContainerDimensions] = useState({});
  const resizeHandler = useCallback(() => {
    const { width, height } = mapContainerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  }, [mapContainerRef]);
  useLayoutEffect(() => {
    const { width, height } = mapContainerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });

    let resizeObserver = new ResizeObserver(() => resizeHandler());
    resizeObserver.observe(mapContainerRef.current);
  }, [mapContainerRef, resizeHandler]);

  const biscuitContainerRef = useRef();

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

    map.addSource("mapbox-streets", {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    });
    map.addLayer({
      id: "road",
      source: "mapbox-streets",
      "source-layer": "road",
      type: "line",
      paint: {
        "line-color": "#ffffff"
      }
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

  useEffect(() => {
    const map = mapRef.current.getMap();
    if (map && biscuitContainerRef.current != null) {
      const features = map.queryRenderedFeatures({ layers: ["road"] });
      console.dir(features);

      console.dir(biscuitContainerRef.current);
      const geoJson = { type: "FeatureCollection", features };

      const canvas = biscuitContainerRef.current;
      const { width, height } = canvas;
      const context = canvas.getContext("2d");
      const projection = geoMercator().fitSize([width, height], geoJson);
      const generator = geoPath(projection).context(context);
      context.fillStyle = "black";
      context.strokeStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      generator(geoJson);
      context.stroke();
    }
  }, [mapRef, biscuitContainerRef, center]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div ref={mapContainerRef} style={{ width: "100vw", height: "50vh" }}>
        <ReactMapGL
          ref={mapRef}
          {...viewport}
          {...containerDimensions}
          onViewportChange={viewportUpdated}
          onLoad={onLoad}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        />
      </div>
      <canvas
        ref={biscuitContainerRef}
        style={{ width: "100vw", height: "50vh" }}
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
