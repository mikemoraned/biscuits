import unittest
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import Piece, BitmapImage

unittest.util._MAX_LENGTH = 2000


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
        pieces = splitter.split('edinburgh')
        self.assertEqual(len(pieces), 1)
        self.assertEqual(pieces[0],
                         Piece(id='edinburgh_0',
                               bitmap_image=BitmapImage(
                                   data="data:image/png;base64,iVBORw0KGgoA"
                                        "AAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAA"
                                        "AADUlEQVR42mNkYPhfDwAChwGA60e6kgAA"
                                        "AABJRU5ErkJggg==",
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131)))

    @staticmethod
    def idsOf(pieces):
        return list(map(lambda p: p.id, pieces))


if __name__ == '__main__':
    unittest.main()
