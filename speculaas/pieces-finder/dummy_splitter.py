from images_for_tests import transparent_image, transparent_image_data_url
from schema import Piece, BitmapImage, Place, SpriteOffset, Sprite


class DummySplitter:
    def __init__(self, place_by_id):
        self.place_by_id = place_by_id
        self.data_url = transparent_image_data_url;

    def split(self, place_id):
        if place_id in self.place_by_id:
            place = self.place_by_id[place_id]
            pieces = list([Piece(id="{}_{}".format(place_id, index),
                                 bitmap_image=BitmapImage(
                                     x=entry['x'],
                                     y=entry['y'],
                                     width=entry['width'],
                                     height=entry['height'],
                                     sprite_offset=SpriteOffset(
                                         x=entry['sprite_offset'],
                                         y=0
                                     ))
                                 ) for index, entry in enumerate(place)])
            return Place(id=place_id,
                         sprite=Sprite(image=transparent_image),
                         pieces=pieces)
        else:
            None
