# Spike

- (/) get just the features within reticule
- (/) redraw features using geojson on top of canvas
- (/) make sure the features drawn are restricted to the reticule
  - sort-of: the features shown are those which overlap the reticule, but they
    may extend beyond the reticule
  - attempted to use d3 clipExtent to also restrict what is drawn to only be what
    is in the reticule, but couldn't get it work.
- (/) get and draw features from a bespoke layer
  - technically, no, I haven't done this, but the intent of this was to allow
    features shown to be filtered, and I've done that using a direct filter
    on `queryRenderedFeatures`
