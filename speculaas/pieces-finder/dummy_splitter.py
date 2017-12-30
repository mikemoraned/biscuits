from schema import Piece, BitmapImage, Place, SpriteOffset, Sprite

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class DummySplitter:
    def __init__(self, place_by_id):
        self.place_by_id = place_by_id

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
                         sprite=Sprite(data_url=DUMMY_PNG),
                         pieces=pieces)
        else:
            None
