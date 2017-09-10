# Biscuits

This is a small project for playing with automatically destructuring 
cities in a similarish way to that done by the artist Armelle Caron,
see http://www.armellecaron.fr/works/les-villes-rangees/.

## September 2017

<img src="public/sept2017.jerusalem.png" />

The overall strategy is:
1. Manually construct an image of a city via a Grab of a Black and White
map, from somewhere like [Snazzy Maps](https://snazzymaps.com/style/8007/black-and-white-without-labels),
such there is a clear figure/ground delineation.
2. Use OpenCV to extract and and dump:
  * basic labelled metadata (dimensions / positions) of connected components
  * angle of bounding rectangle which minimises area (gives guidance as to
  how it should be rotated to pack better)
  * connected components as separate images, rendered as a transparent png
  with area in black
3. Use React + CSS animations to:
  * sort and pack areas by size
  * animate the chunks into place over original image