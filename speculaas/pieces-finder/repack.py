import sys
from rectpack import newPacker
import cv2
import numpy as np

from precomputed_lookup_splitter import PreComputedLookupSplitter


def convert_binned_to_cv2_rectangles(rect_list):
    for rect in rect_list:
        (bin_count, x, y, width, height, rid) = rect
        top_left = (x, y)
        bottom_right = (x + width, y + height)
        yield (top_left, bottom_right)


def repack(splitter, place_id):
    print("Doing {}".format(place_id))
    place = splitter.split(place_id)
    packer = newPacker()
    for piece in place.pieces:
        packer.add_rect(width=piece.bitmap_image.width,
                        height=piece.bitmap_image.height,
                        rid=piece.id)

    packer.add_bin(width=10000, height=10000)

    packer.pack()
    cv2_rects = list(convert_binned_to_cv2_rectangles(packer.rect_list()))
    max_width = -1
    max_height = -1
    for cv2_rect in cv2_rects:
        (top_left, bottom_right) = cv2_rect
        (x, y) = bottom_right
        max_width = max(max_width, x)
        max_height = max(max_height, y)

    print("{}: {} rects, width={}, height={}".format(place_id,
                                                     len(cv2_rects),
                                                     max_width,
                                                     max_height))

    img = np.zeros((max_height, max_width, 3), np.uint8)
    color = (0, 255, 0)
    for cv2_rect in cv2_rects:
        (top_left, bottom_right) = cv2_rect
        cv2.rectangle(img, top_left, bottom_right, color, 3)

    cv2.imwrite('{}_repacked.png'.format(place_id), img)


if __name__ == '__main__':
    precomputed_dir = sys.argv[1]
    place_ids = sys.argv[2].split(',')
    splitter = PreComputedLookupSplitter.from_dir(precomputed_dir)
    print("Loaded {} ids from {}".format(len(splitter.place_ids),
                                         precomputed_dir))
    for place_id in place_ids:
        repack(splitter, place_id)
