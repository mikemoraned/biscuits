from schema import Piece, BitmapImage

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class DummySplitter:
    def split(self):
        return [
            Piece(id="0",
                  bitmapImage=BitmapImage(
                      data=DUMMY_PNG, x=0, y=0, width=100, height=200)
                  )
        ]
