from schema import Piece, BitmapImage

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class DummySplitter:

    def __init__(self, pieces):
        self.pieces = pieces

    def split(self):
        return list([Piece(id=str(index),
                           bitmapImage=BitmapImage(
                               data=DUMMY_PNG,
                               x=entry['x'],
                               y=entry['y'],
                               width=entry['width'],
                               height=entry['height'])
                           ) for index, entry in enumerate(self.pieces)])

