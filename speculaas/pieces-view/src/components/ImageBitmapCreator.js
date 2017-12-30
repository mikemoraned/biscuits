class ImageBitmapCreator {
  create(id, dataURL) {
    if (window.createImageBitmap) {
      return fetch(dataURL)
        .then((resp) => resp.blob())
        .then((blob) => window.createImageBitmap(blob));
    }
    else {
      const img = new Image();
      return new Promise((resolve, ignoredReject) => {
        img.addEventListener('load', () => {
          resolve(img)
        }, false);
        img.src = dataURL;
      });
    }
  }
}

export default ImageBitmapCreator;