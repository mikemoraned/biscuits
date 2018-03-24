import logging
from math import sqrt

import sys
from PIL import Image

from precomputed_lookup_splitter import PreComputedLookupSplitter
from rectpack import newPacker

from schema.bitmap_image import BitmapImage
from schema.piece import Place
from schema.place import Piece
from schema.sprite import Sprite
from schema.sprite_offset import SpriteOffset


class SpritePacker:
    def __init__(self,
                 input_dir_name,
                 packed_dir_name,
                 input_dir_has_background,
                 area_expansion=1.5):
        self.input_dir_name = input_dir_name
        self.packed_dir_name = packed_dir_name
        self.input_dir_has_background = input_dir_has_background
        self.area_expansion = area_expansion

    def pack(self, place_id):
        splitter = \
            PreComputedLookupSplitter.from_dir(self.input_dir_name,
                                               has_background=
                                               self.input_dir_has_background)
        place = splitter.split(place_id)

        packer = self.prepare_packer(place)

        packer.pack()

        rect_list = packer.rect_list()

        bounds = self.find_min_bounds(rect_list)

        logging.info("{}: {} rects, bounds={}".format(place_id,
                                                      len(rect_list),
                                                      bounds))

        rect_by_id = {}
        for rect in rect_list:
            (bin_count, x, y, width, height, rid) = rect
            rect_by_id[rid] = rect

        repacked_place = self.repack_place(place, bounds, rect_by_id)

        PreComputedLookupSplitter.save_to_dir(repacked_place,
                                              self.packed_dir_name)

    def prepare_packer(self, place):
        packer = newPacker(rotation=False)
        area = 0
        for piece in place.pieces:
            packer.add_rect(width=piece.bitmap_image.width,
                            height=piece.bitmap_image.height,
                            rid=piece.id)
            area += piece.bitmap_image.width * piece.bitmap_image.height

        bin_area = area * self.area_expansion
        bin_side_length = int(sqrt(bin_area))
        logging.info("Using bin of size {} x {} = {}".format(bin_side_length,
                                                             bin_side_length,
                                                             bin_area))
        packer.add_bin(width=bin_side_length, height=bin_side_length)
        return packer

    @staticmethod
    def find_min_bounds(rect_list):
        def max_bounds(rect):
            (bin_count, x, y, width, height, rid) = rect
            return x + width, y + height

        first = rect_list[0]
        (max_width, max_height) = max_bounds(first)
        for rect in rect_list:
            (width, height) = max_bounds(rect)
            max_width = max(max_width, width)
            max_height = max(max_height, height)

        return max_width, max_height

    def repack_place(self, place, bounds, rect_by_id):
        return Place(id=place.id,
                     sprite=self.repack_sprite(place, bounds, rect_by_id),
                     pieces=self.repack_pieces(place.pieces, rect_by_id))

    @staticmethod
    def repack_sprite(place, bounds, rect_by_id):
        new_sprite_image = Image.new('RGBA', bounds)

        for piece in place.pieces:
            image = place.sprite.extract(piece.bitmap_image)
            (bin_count, x, y, width, height, rid) = rect_by_id[piece.id]
            box = (x, y, x + width, y + height)
            new_sprite_image.paste(image, box)

        return Sprite(image=new_sprite_image)

    def repack_pieces(self, pieces, rect_by_id):
        return list([Piece(id=p.id,
                           bitmap_image=
                           self.repack_bitmap_image(p.bitmap_image,
                                                    rect_by_id[p.id]))
                     for p in pieces])

    @staticmethod
    def repack_bitmap_image(bitmap_image, rect):
        (bin_count, x, y, width, height, rid) = rect
        return BitmapImage(x=bitmap_image.x,
                           y=bitmap_image.y,
                           width=bitmap_image.width,
                           height=bitmap_image.height,
                           sprite_offset=SpriteOffset(x=x, y=y))


if __name__ == '__main__':
    input_dir_name = sys.argv[1]
    output_dir_name = sys.argv[2]
    place_ids = sys.argv[3].split(',')

    sprite_packer = SpritePacker(input_dir_name,
                                 output_dir_name,
                                 input_dir_has_background=True)

    for place_id in place_ids:
        sprite_packer.pack(place_id)
