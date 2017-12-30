import unittest
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import Piece, BitmapImage, SpriteOffset, Sprite

unittest.util._MAX_LENGTH = 2000

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

class TestPreComputedLookupSplitter(unittest.TestCase):
    def __init__(self, method_name):
        super().__init__(method_name)
        self.maxDiff = None

    def test_finds_edinburgh(self):
        splitter = PreComputedLookupSplitter.from_dir("precomputed_test")
        self.assertIn('edinburgh', splitter.place_ids)

    def test_ids_are_globally_unique(self):
        splitter = PreComputedLookupSplitter.from_dir("precomputed_test")
        edinburgh_ids = self.idsOf(splitter.split('edinburgh'))
        edinburgh2_ids = self.idsOf(splitter.split('edinburgh2'))
        for id in edinburgh2_ids:
            self.assertNotIn(id, edinburgh_ids)

    def test_finds_and_loads_edinburgh(self):
        splitter = PreComputedLookupSplitter.from_dir("precomputed_test")
        place = splitter.split('edinburgh')
        self.assertEqual(place.id, 'edinburgh')
        self.assertEqual(place.sprite, Sprite(data_url=DUMMY_PNG))
        self.assertEqual(len(place.pieces), 1)
        self.assertEqual(place.pieces[0],
                         Piece(id='edinburgh_0',
                               bitmap_image=BitmapImage(
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131,
                                   sprite_offset=SpriteOffset(x=1350, y=0))))

    @staticmethod
    def idsOf(place):
        return list(map(lambda p: p.id, place.pieces))


if __name__ == '__main__':
    unittest.main()