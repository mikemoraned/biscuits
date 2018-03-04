import logging
import sys

from PIL import Image

from layout.empty_layout_registry import EmptyLayoutRegistry
from layout.layout_generator import LayoutGenerator
from layout.layout_parameters import LayoutParameters
from precomputed_lookup_splitter import PreComputedLookupSplitter

from schema.bitmap_image import BitmapImage
from schema.piece import Piece
from schema.place import Place
from schema.sprite import Sprite
from schema.sprite_offset import SpriteOffset


class SpritePacker:
    DEFAULT = LayoutParameters()

    def __init__(self,
                 input_dir_name,
                 packed_dir_name,
                 input_dir_has_background,
                 layout_generator):
        self.input_dir_name = input_dir_name
        self.packed_dir_name = packed_dir_name
        self.input_dir_has_background = input_dir_has_background
        self.layout_generator = layout_generator

    def pack(self, place_id, parameters=DEFAULT):
        logging.info(
            "Using {} for {}".format(parameters.short_name(), place_id))
        splitter = \
            PreComputedLookupSplitter.from_dir(self.input_dir_name,
                                               layout_registry=
                                               EmptyLayoutRegistry(),
                                               has_background=
                                               self.input_dir_has_background)
        place = splitter.split(place_id)

        layout = \
            self.layout_generator.layout_from_pieces(place_id,
                                                     place.pieces,
                                                     parameters)

        repacked_place = self.repack_place(place, layout)

        PreComputedLookupSplitter.save_to_dir(repacked_place,
                                              self.packed_dir_name)

    def repack_place(self, place, layout):
        return Place(id=place.id,
                     sprite=self.repack_sprite(place, layout),
                     pieces=self.repack_pieces(place.pieces, layout))

    @staticmethod
    def repack_sprite(place, layout):
        new_sprite_image = Image.new('RGBA', layout.bounds)

        for piece in place.pieces:
            image = place.sprite.extract(piece.bitmap_image)
            layout_offset = layout.offset_for_id[piece.id]
            box = (layout_offset.x,
                   layout_offset.y,
                   layout_offset.x + piece.bitmap_image.width,
                   layout_offset.y + piece.bitmap_image.height)
            new_sprite_image.paste(image, box)

        return Sprite(image=new_sprite_image)

    def repack_pieces(self, pieces, layout):
        return list(
            [Piece(id=p.id,
                   bitmap_image=
                   self.repack_bitmap_image(p.bitmap_image,
                                            layout.offset_for_id[p.id]))
             for p in pieces])

    @staticmethod
    def repack_bitmap_image(bitmap_image, layout_offset):
        return BitmapImage(x=bitmap_image.x,
                           y=bitmap_image.y,
                           width=bitmap_image.width,
                           height=bitmap_image.height,
                           sprite_offset=SpriteOffset(x=layout_offset.x,
                                                      y=layout_offset.y))


if __name__ == '__main__':
    input_dir_name = sys.argv[1]
    output_dir_name = sys.argv[2]
    place_ids = sys.argv[3].split(',')

    logging.basicConfig(level=logging.INFO)

    sprite_packer = SpritePacker(input_dir_name,
                                 output_dir_name,
                                 input_dir_has_background=True,
                                 layout_generator=LayoutGenerator())

    for place_id in place_ids:
        sprite_packer.pack(place_id)
