class Batch {
  constructor(imageBitmapBatchComplete, sharedCache) {
    this.imageBitmapBatchComplete = imageBitmapBatchComplete;
    this.sharedCache = sharedCache;
    this.outstandingFetchCount = 0;
    this.outstandingFetches = {};
  }

  create(cacheId, data) {
    const cached = this.sharedCache[cacheId];
    if (cached) {
      return cached;
    }
    else {
      const waiting = this.outstandingFetches[cacheId];
      if (waiting) {
        console.log("Eliding ", cacheId);
        this.outstandingFetches[cacheId] = waiting + 1;
      }
      else {
        this.outstandingFetches[cacheId] = 1;
        this.outstandingFetchCount++;
        console.log("Fetching ", cacheId);
        fetch(data)
          .then((resp) => resp.blob())
          .then((blob) => window.createImageBitmap(blob))
          .then((bitmap) => this.onBitmapCreated(cacheId, bitmap));
      }
      return null;
    }
  }

  onBitmapCreated(cacheId, bitmap) {
    console.log("Fetched ", cacheId);
    this.sharedCache[cacheId] = bitmap;
    if (--this.outstandingFetchCount === 0) {
      console.log("Fetched ", cacheId);
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