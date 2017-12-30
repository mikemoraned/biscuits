class Batch {
  constructor(imageBitmapBatchComplete, sharedCache) {
    this.imageBitmapBatchComplete = imageBitmapBatchComplete;
    this.sharedCache = sharedCache;
    this.outstanding = 0;
  }

  create(cacheId, data) {
    const cached = this.sharedCache[cacheId];
    if (cached) {
      return cached;
    }
    else {
      this.outstanding++;
      fetch(data)
        .then((resp) => resp.blob())
        .then((blob) => window.createImageBitmap(blob))
        .then((bitmap) => this.onBitmapCreated(cacheId, bitmap))
      return null;
    }
  }

  onBitmapCreated(cacheId, bitmap) {
    this.sharedCache[cacheId] = bitmap;
    if (--this.outstanding === 0) {
      this.imageBitmapBatchComplete();
    }
  }
}

class ImageBitmapCreator {
  constructor(imageBitmapBatchComplete) {
    this.imageBitmapBatchComplete = imageBitmapBatchComplete;
    this.cache = {};
  }

  newBatch() {
    return new Batch(this.imageBitmapBatchComplete, this.cache);
  }
}

export default ImageBitmapCreator;