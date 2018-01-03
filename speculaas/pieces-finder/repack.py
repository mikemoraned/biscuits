import sys
from rectpack import newPacker
import cv2
import numpy as np

from precomputed_lookup_splitter import PreComputedLookupSplitter

precomputed_dir = sys.argv[1]
place_ids = sys.argv[2].split(',')
splitter = PreComputedLookupSplitter.from_dir(precomputed_dir)
print("Loaded {} ids from {}".format(len(splitter.place_ids),
                                     precomputed_dir))

for place_id in place_ids:
    print("Doing {}".format(place_id))
    place = splitter.split(place_id)
    packer = newPacker()
    for piece in place.pieces:
        packer.add_rect(width=piece.bitmap_image.width,
                        height=piece.bitmap_image.height,
                        rid=piece.id)

    packer.add_bin(width=10000, height=10000)

    packer.pack()

    img = np.zeros((10000, 10000, 3), np.uint8)
    color = (0, 255, 0)
    for rect in packer.rect_list():
        print(rect)
        (bin_count, x, y, width, height, rid) = rect
        top_left = (x, y)
        bottom_right = (x + width, y + height)
        cv2.rectangle(img, top_left, bottom_right, color, 3)

    cv2.imwrite('{}_repacked.png'.format(place_id), img)
