# Spike

This follows on from the `redraw-layer` spike.

- (x) draw features clipped to reticule by:
  - drawing features to an off-screen canvas
  - getting this as an image from the canvas and drawing over main screen
- (x) use `BiscuitFinder` on the off-screen canvas image to find biscuits
  and then redraw on screen, overlaying map
