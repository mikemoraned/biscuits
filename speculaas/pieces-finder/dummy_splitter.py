from schema import Piece, BitmapImage

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class DummySplitter:
    def __init__(self, pieces_by_place_id):
        self.pieces_by_place_id = pieces_by_place_id

    def split(self, place_id):
        if place_id in self.pieces_by_place_id:
            pieces = self.pieces_by_place_id[place_id]
            return list([Piece(id=str(index),
                               bitmap_image=BitmapImage(
                                   data=DUMMY_PNG,
                                   x=entry['x'],
                                   y=entry['y'],
                                   width=entry['width'],
                                   height=entry['height'])
                               ) for index, entry in enumerate(pieces)])
        else:
            []
