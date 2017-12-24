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
        self.assertEqual(splitter.place_ids, ['edinburgh'])

    def test_finds_and_loads_edinburgh(self):
        splitter = PreComputedLookupSplitter.from_dir("precomputed_test")
        pieces = splitter.split('edinburgh')
        self.assertEqual(len(pieces), 1)
        self.assertEqual(pieces[0],
                         Piece(id='0',
                               bitmap_image=BitmapImage(
                                   data="data:image/png;base64,iVBORw0KGgoA"
                                        "AAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAA"
                                        "AADUlEQVR42mNkYPhfDwAChwGA60e6kgAA"
                                        "AABJRU5ErkJggg==",
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131)))


if __name__ == '__main__':
    unittest.main()
