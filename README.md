# Biscuits

This is a side project for playing with automatically destructuring 
cities in a similarish way to that done by the artist Armelle Caron,
see http://www.armellecaron.fr/works/les-villes-rangees/.

## April 2018 : Speculaas

<a href="https://youtu.be/6DsjwTlskkM"><img src="public/apr2018.jerusalem.png" /></a>

I've re-used the city images and the connected components from the previous work. This then allowed me to:

1. [pieces-finder](speculaas/pieces-finder): For each set of connected components, process
them using the [rectpack](https://github.com/secnot/rectpack) bin-packing library in two ways:
    1. find a compact sprite packing of the connected components to reduce download size for any
    visualisations; the previous packing was very simple but large
    2. find all variations of the bin-packings available and make them available as alternative layouts
2. [pieces-view](speculaas/pieces-view): provide visualisations of a selected subset of layouts which can
be animated and displayed at reasonable speed on both mobile and desktop: http://speculaas.houseofmoran.io/
3. make above layouts available at a [GraphQL endpoint](http://speculaas.houseofmoran.io/graphql) so that
others could build on this if they wanted to.

I also used this an opportunity to:
* learn how to deploy and use a kubernetes cluster
* learn a practical application of GraphQL

## September 2017

<img src="public/sept2017.jerusalem.png" />

The overall strategy is:
1. Manually construct an image of a city via a Grab of a Black and White
map, from somewhere like [Snazzy Maps](https://snazzymaps.com/style/8007/black-and-white-without-labels),
such there is a clear figure/ground delineation.
2. Use OpenCV to extract and and dump:
  * basic labelled metadata (dimensions / positions) of connected components
  * connected components as separate images, rendered as a transparent png
  with area in black
3. Use React + Canvas rendering + d3 animations to:
  * sort and pack areas by size
  * animate the chunks into place over original image