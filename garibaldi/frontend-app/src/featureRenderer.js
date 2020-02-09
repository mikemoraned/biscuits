import { LngLat } from "mapbox-gl";
import { geoPath, geoTransform } from "d3-geo";

export function createFeatureRenderer(project, ctx) {
  const projection = geoTransform({
    point: function(lon, lat) {
      const point = project(new LngLat(lon, lat).toArray());
      this.stream.point(point[0], point[1]);
    }
  });

  const generator = geoPath()
    .projection(projection)
    .context(ctx);

  return generator;
}
