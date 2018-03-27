from schema.layout_offset_lookup_function import LayoutOffsetLookupFn
from schema.layout_summary import LayoutSummary
from schema.piece import Piece
from schema.place import Place
from tests.images_for_tests import transparent_image, \
    transparent_image_data_url
from schema.bitmap_image import BitmapImage
from schema.sprite import Sprite
from schema.sprite_offset import SpriteOffset


class DummySplitter:
    def __init__(self, place_by_id, layout_summaries, layout_registry):
        self.place_by_id = place_by_id
        self.data_url = transparent_image_data_url;
        self.layout_summaries = layout_summaries
        self.layout_registry = layout_registry

    def split(self, place_id):
        if place_id in self.place_by_id:
            place = self.place_by_id[place_id]

            pieces = list()
            for index, entry in enumerate(place):
                piece_id = "{}_{}".format(place_id, index)

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
                                  sprite_offset=SpriteOffset(
                                      x=entry['sprite_offset'],
                                      y=0
                                  ),
                                  layout_offset_lookup=layout_offset_lookup)
                              )

                pieces.append(piece)

            return Place(id=place_id,
                         sprite=Sprite(image=transparent_image),
                         pieces=pieces)
        else:
            None
