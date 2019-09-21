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

  const canvasContainerRef = useRef();

  const mapRef = useRef();

  const [layersDefined, setLayersDefined] = useState(false);
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
    setLayersDefined(true);
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

  const [scaledCanvas, setScaledCanvas] = useState(false);
  useEffect(() => {
    if (!scaledCanvas && canvasContainerRef.current != null) {
      const canvas = canvasContainerRef.current;
      const { width, height } = canvas;

      const scale = window.devicePixelRatio;
      canvas.width = width * scale;
      canvas.height = height * scale;

      console.log("scaled");
      console.log("w: ", canvas.width, "h: ", canvas.height);

      const context = canvas.getContext("2d");
      context.fillStyle = "blue";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "red";
      context.fillRect(0, 0, 30, 30);
      context.scale(scale, scale);
      context.fillStyle = "green";
      context.fillRect(0, 0, 10, 10);

      setScaledCanvas(true);
    }
  }, [scaledCanvas, canvasContainerRef]);
  useEffect(() => {
    const map = mapRef.current.getMap();
    if (
      // false &&
      map &&
      scaledCanvas &&
      layersDefined &&
      canvasContainerRef.current != null
    ) {
      const features = map.queryRenderedFeatures({ layers: ["road"] });
      console.dir(features);

      console.dir(canvasContainerRef.current);
      const geoJson = { type: "FeatureCollection", features };

      const canvas = canvasContainerRef.current;
      const { width, height } = canvas;
      console.log("w: ", width, "h: ", height);

      const scale = window.devicePixelRatio;
      const context = canvas.getContext("2d");
      // context.scale(scale, scale);
      const projection = geoMercator().fitSize(
        [width / scale, height / scale],
        geoJson
      );
      const generator = geoPath(projection).context(context);
      context.fillStyle = "black";
      context.strokeStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "blue";
      context.fillRect(0, 0, 25, 25);
      context.beginPath();
      generator(geoJson);
      context.stroke();
    }
  }, [scaledCanvas, layersDefined, mapRef, canvasContainerRef, center]);

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
        ref={canvasContainerRef}
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
