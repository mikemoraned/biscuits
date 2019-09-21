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

class BiscuitFinderLayer {
  constructor({ width, height, biscuitFinder, memory }) {
    this.width = width;
    this.height = height;
    this.biscuitFinder = biscuitFinder;
    this.memory = memory;
  }

  draw(context) {
    console.time("BiscuitFinderLayer.draw");
    const inputImageData = context.getImageData(0, 0, this.width, this.height);
    console.time("find biscuits");
    console.dir(this.biscuitFinder.find_biscuits(inputImageData.data));
    console.timeEnd("find biscuits");

    console.time("draw image");
    const outputPointer = this.biscuitFinder.output();
    const outputArray = new Uint8ClampedArray(
      this.memory.buffer,
      outputPointer,
      4 * this.width * this.height
    );

    const outputImageData = new ImageData(outputArray, this.width, this.height);

    context.putImageData(outputImageData, 0, 0);
    console.timeEnd("draw image");
    console.timeEnd("BiscuitFinderLayer.draw");
  }
}

function loadBiscuitFinderLayer({ width, height, setBiscuitFinderLayer }) {
  console.time("loadBiscuitFinderLayer");
  Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ])
    .then(([biscuiting, biscuiting_bg]) => {
      const { BiscuitFinder } = biscuiting;
      const { memory } = biscuiting_bg;
      const biscuitFinder = BiscuitFinder.new(width, height);

      setBiscuitFinderLayer(
        new BiscuitFinderLayer({ width, height, biscuitFinder, memory })
      );
      console.timeEnd("loadBiscuitFinderLayer");
    })
    .catch(err => {
      console.log(err);
    });
}

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
  const locations = [
    {
      latitude: 37.7577,
      longitude: -122.4376,
      name: "San Francisco",
      zoom: 13
    },
    { latitude: 31.771959, longitude: 35.217018, name: "Jerusalem", zoom: 13 },
    { latitude: 55.953251, longitude: -3.188267, name: "Edinburgh", zoom: 13 },
    { latitude: 40.71427, longitude: -74.00597, name: "New York", zoom: 13 },
    { latitude: 48.85341, longitude: 2.3488, name: "Paris", zoom: 13 },
    { latitude: 47.49801, longitude: 19.03991, name: "Budapest", zoom: 13 },
    { latitude: 41.38879, longitude: 2.15899, name: "Barcelona", zoom: 13 }
  ];
  const [locationId, setLocationId] = useState(1);

  const [viewport, setViewport] = useState({
    width: "100vh",
    height: "100vh",
    ...locations[locationId]
  });

  function handleLocationIdChange(event) {
    const locationId = event.target.value;
    setViewport(viewport => {
      return {
        ...viewport,
        ...locations[locationId]
      };
    });
    setLocationId(locationId);
  }

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
      // context.fillStyle = "blue";
      // context.fillRect(0, 0, canvas.width, canvas.height);
      // context.fillStyle = "red";
      // context.fillRect(0, 0, 30, 30);
      context.scale(scale, scale);
      // context.fillStyle = "green";
      // context.fillRect(0, 0, 10, 10);

      setScaledCanvas(true);
    }
  }, [scaledCanvas, canvasContainerRef]);

  const [biscuitFinderLayer, setBiscuitFinderLayer] = useState(null);
  useEffect(() => {
    if (
      scaledCanvas &&
      biscuitFinderLayer == null &&
      canvasContainerRef.current != null
    ) {
      const canvas = canvasContainerRef.current;
      const { width, height } = canvas;

      loadBiscuitFinderLayer({ width, height, setBiscuitFinderLayer });
    }
  }, [scaledCanvas, canvasContainerRef, biscuitFinderLayer]);

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
      var seenClasses = {};
      features.forEach(f => {
        const c = f.properties.class;
        if (seenClasses[c]) {
          seenClasses[c] = seenClasses[c] + 1;
        } else {
          seenClasses[c] = 1;
        }
      });
      console.dir(seenClasses);
      const allowedClasses = [
        "street",
        "pedestrian",
        "motorway",
        "motorway_link",
        "path",
        "primary",
        "primary_link",
        "secondary",
        "secondary_link",
        "tertiary",
        "tertiary_link",
        "track"
      ];
      const filteredFeatures = features.filter(f => {
        return allowedClasses.indexOf(f.properties.class) >= 0;
      });
      const bounds = map.getBounds();
      // console.dir(bounds);
      const geoJsonBounds = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  bounds.getNorthEast().toArray(),
                  bounds.getSouthEast().toArray(),
                  bounds.getSouthWest().toArray(),
                  bounds.getNorthWest().toArray(),
                  bounds.getNorthEast().toArray()
                ]
              ]
            }
          }
        ]
      };
      // console.dir(geoJsonBounds);

      // console.dir(canvasContainerRef.current);
      const geoJson = { type: "FeatureCollection", features: filteredFeatures };

      const canvas = canvasContainerRef.current;
      const { width, height } = canvas;
      // console.log("w: ", width, "h: ", height);

      const scale = window.devicePixelRatio;
      const context = canvas.getContext("2d");
      // context.scale(scale, scale);
      const projection = geoMercator().fitSize(
        [width / scale, height / scale],
        geoJsonBounds
      );
      const generator = geoPath(projection).context(context);
      context.fillStyle = "black";
      // context.strokeStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      // context.fillStyle = "blue";
      // context.fillRect(0, 0, 25, 25);
      context.beginPath();
      context.strokeStyle = "red";
      generator(geoJsonBounds);
      context.stroke();

      context.beginPath();
      context.strokeStyle = "white";
      generator(geoJson);
      context.stroke();

      if (biscuitFinderLayer != null) {
        biscuitFinderLayer.draw(context);
      }
    }
  }, [
    scaledCanvas,
    layersDefined,
    mapRef,
    canvasContainerRef,
    center,
    biscuitFinderLayer
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <select value={locationId} onChange={handleLocationIdChange}>
          {locations.map((location, index) => {
            return (
              <option value={index} key={index}>
                {location.name}
              </option>
            );
          })}
        </select>
      </div>
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
