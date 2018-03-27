import glob
import json
import re
import logging

from layout.empty_layout_registry import EmptyLayoutRegistry
from schema.bitmap_image import BitmapImage
from schema.layout_offset_lookup_function import LayoutOffsetLookupFn
from schema.layout_summary import LayoutSummary
from schema.piece import Piece
from schema.place import Place
from schema.sprite import Sprite
from schema.sprite_offset import SpriteOffset


class PreComputedLookupSplitter:
    def __init__(self, dir_name, place_ids,
                 layout_registry=EmptyLayoutRegistry(),
                 has_background=False):
        self.has_background = has_background
        self.dir_name = dir_name
        self.place_ids = place_ids
        self.layout_registry = layout_registry

        logging.info("loaded {} ids from {}".format(len(self.place_ids),
                                                    dir_name))

    @classmethod
    def from_dir(cls, dir_name, layout_registry, has_background=False):
        place_ids = list(cls.place_ids_in_dir(dir_name))
        return PreComputedLookupSplitter(dir_name=dir_name,
                                         place_ids=place_ids,
                                         layout_registry=layout_registry,
                                         has_background=has_background)

    @classmethod
    def save_to_dir(cls, place, dir_name):
        collapsed = [
            {
                "id": cls.index_from_global_id(piece.id),
                "x": piece.bitmap_image.x,
                "y": piece.bitmap_image.y,
                "width": piece.bitmap_image.width,
                "height": piece.bitmap_image.height,
                "sprite": {
                    "x": piece.bitmap_image.sprite_offset.x,
                    "y": piece.bitmap_image.sprite_offset.y
                }
            }
            for piece in place.pieces]

        image_file_name = "{}/{}.label_sprites.png".format(dir_name, place.id)
        place.sprite.save_to_filename(image_file_name)
        logging.info("saved image to {}".format(image_file_name))

        json_file_name = "{}/{}.labels.json".format(dir_name, place.id)
        with open(json_file_name, 'w') as out:
            json.dump(collapsed, out, indent=True, sort_keys=True)
        logging.info(
            "saved {} pieces to {}".format(len(collapsed), json_file_name))

    def split(self, place_id):
        if place_id in self.place_ids:
            sprite = self.load_sprite_from_file(place_id)
            pieces = list()
            pieces_from_file = self.load_pieces_from_file(place_id)
            logging.info("loaded {} pieces from file".format(len(pieces_from_file)))
            for entry in pieces_from_file:
                piece_id = self.make_global_id(place_id, entry['id'])

                layout_offset_lookup = \
                    LayoutOffsetLookupFn(self.layout_registry,
                                         place_id,
                                         piece_id)

                piece = Piece(id=piece_id,
                              bitmap_image=BitmapImage(
                                  x=entry['x'],
                                  y=entry['y'],
                                  width=entry['width'],
                                  height=entry['height'],
                                  sprite_offset=self.read_sprite_offset(
                                      entry),
                                  layout_offset_lookup=layout_offset_lookup))
                pieces.append(piece)

            pieces_filtered = self.filter_out_background(pieces)
            logging.info(
                "{} pieces left after background filtering"
                    .format(len(pieces_filtered)))

            return Place(id=place_id,
                         sprite=sprite,
                         pieces=pieces_filtered)
        else:
            None

    def make_global_id(self, place_id, index):
        return "{}_{}".format(place_id, index)

    @classmethod
    def index_from_global_id(cls, global_id):
        match = re.search(r'.+_(\d+)$', global_id)
        return match.group(1)

    def load_pieces_from_file(self, place_id):
        with open("{}/{}.labels.json".format(self.dir_name, place_id)) as file:
            return json.load(file)

    def load_sprite_from_file(self, place_id):
        filename = "{}/{}.label_sprites.png".format(self.dir_name, place_id)
        return Sprite.from_filename(filename)

    @staticmethod
    def read_sprite_offset(entry):
        if "sprite" in entry:
            return SpriteOffset(
                x=entry['sprite']['x'],
                y=entry['sprite']['y']
            )
        else:
            return SpriteOffset(
                x=entry['sprite_offset'],
                y=0
            )

    @classmethod
    def place_ids_in_dir(cls, dir_name):
        for file in glob.glob("{}/*.labels.json".format(dir_name)):
            match = re.search("{}/(.+).labels.json".format(dir_name), file)
            if match:
                yield match.group(1)

    def filter_out_background(self, pieces):
        def is_background(piece):
            bitmap_image = piece.bitmap_image
            sprite_offset = bitmap_image.sprite_offset
            return bitmap_image.x == 0 and sprite_offset.x == 0

        if self.has_background:
            return list(filter(lambda p: not is_background(p), pieces))
        else:
            return pieces
