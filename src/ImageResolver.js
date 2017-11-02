class ImageResolver {
    constructor(baseName) {
        this.baseName = baseName;
    }

    resolveImages(withIds, labels, callback) {
        const labelsById = [];
        labels.forEach((label) => {
            labelsById[label["id"]] = label;
        });
        const imageName = `data/${this.baseName}.label_sprites.png`;
        return fetch(imageName)
            .then((response) => {
                console.log(`${imageName}: ${response.status}`);
                return response.blob();
            })
            .then((blob) => {
                return window.createImageBitmap(blob);
            })
            .then((spriteBitmap) => {
                return Promise.all(withIds.map((withId) => {
                    const id = withId.id;
                    const label = labelsById[id];
                    return window.createImageBitmap(spriteBitmap, label.sprite_offset, 0, label.width, label.height)
                        .then((bitmap) => {
                            console.log(`${imageName}: ${id}: created bitmap`);
                            return { id, bitmap };
                        });
                }));
            })
            .then((bitmapWithIds) => {
                const images = [];
                bitmapWithIds.forEach((bitmapWithId) => {
                    const { id, bitmap } = bitmapWithId;
                    images[id] = bitmap;
                });
                callback(images);
            });
    }
}

export default ImageResolver;