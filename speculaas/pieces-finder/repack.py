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
        yield (top_left, bottom_right, rid)


def build_sprite_image_map(place):
    image_for_id = {}
    sprite_image = cv2.imdecode(np.asarray(place.sprite.as_png_bytes(),
                                           dtype=np.uint8),
                                cv2.IMREAD_UNCHANGED)
    for piece in place.pieces:
        x_min = piece.bitmap_image.sprite_offset.x
        x_max = x_min + piece.bitmap_image.width
        y_min = piece.bitmap_image.sprite_offset.y
        y_max = y_min + piece.bitmap_image.height
        image_for_id[piece.id] = sprite_image[y_min:y_max, x_min:x_max]
    return image_for_id


def repack(splitter, place_id):
    print("Doing {}".format(place_id))
    place = splitter.split(place_id)
    sprite_image_map = build_sprite_image_map(place)

    packer = newPacker(rotation=False)
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
        (top_left, bottom_right, id) = cv2_rect
        (x, y) = bottom_right
        max_width = max(max_width, x)
        max_height = max(max_height, y)

    print("{}: {} rects, width={}, height={}".format(place_id,
                                                     len(cv2_rects),
                                                     max_width,
                                                     max_height))

    img = np.zeros((max_height, max_width, 4), np.uint8)
    color = (0, 255, 0, 255)
    for cv2_rect in cv2_rects:
        (top_left, bottom_right, id) = cv2_rect
        (x_min, y_min) = top_left
        (x_max, y_max) = bottom_right
        img[y_min:y_max, x_min:x_max] = sprite_image_map[id]
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
