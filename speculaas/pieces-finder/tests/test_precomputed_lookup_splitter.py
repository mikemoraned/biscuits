import tempfile
import unittest

from layout.layout_registry import LayoutRegistry
from schema.layout_summary import LayoutSummary
from tests.images_for_tests import transparent_image
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema.bitmap_image import BitmapImage
from schema.place import Piece
from schema.sprite import Sprite
from schema.sprite_offset import SpriteOffset

unittest.util._MAX_LENGTH = 2000


class TestPreComputedLookupSplitter(unittest.TestCase):
    def __init__(self, method_name):
        super().__init__(method_name)
        self.maxDiff = None

    def test_finds_edinburgh(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        splitter = PreComputedLookupSplitter.from_dir("tests/precomputed",
                                                      layout_registry)
        self.assertIn('edinburgh', splitter.place_ids)

    def test_ids_are_globally_unique(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        splitter = PreComputedLookupSplitter.from_dir("tests/precomputed",
                                                      layout_registry)
        edinburgh_ids = self.idsOf(splitter.split('edinburgh'))
        edinburgh2_ids = self.idsOf(splitter.split('edinburgh2'))
        for id in edinburgh2_ids:
            self.assertNotIn(id, edinburgh_ids)

    def test_finds_and_loads_edinburgh(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        splitter = PreComputedLookupSplitter.from_dir("tests/precomputed",
                                                      layout_registry)
        place = splitter.split('edinburgh')
        self.assertEqual(place.id, 'edinburgh')
        self.assertEqual(place.sprite, Sprite(image=transparent_image))
        self.assertEqual(len(place.pieces), 1)
        self.assertEqual(place.pieces[0],
                         Piece(id='edinburgh_1',
                               bitmap_image=BitmapImage(
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131,
                                   sprite_offset=SpriteOffset(x=1350, y=0))))

    def test_ignores_background_in_sprite(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        splitter = PreComputedLookupSplitter.from_dir("tests/precomputed",
                                                      layout_registry,
                                                      has_background=True)
        place = splitter.split('edinburgh_withbackground')
        self.assertEqual(place.id, 'edinburgh_withbackground')
        self.assertEqual(place.sprite, Sprite(image=transparent_image))
        self.assertEqual(len(place.pieces), 1)
        self.assertEqual(place.pieces[0],
                         Piece(id='edinburgh_withbackground_1',
                               bitmap_image=BitmapImage(
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131,
                                   sprite_offset=SpriteOffset(x=1350, y=0))))

    def test_finds_and_loads_edinburgh_with_xy_sprite(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        splitter = PreComputedLookupSplitter.from_dir("tests/precomputed",
                                                      layout_registry)
        place = splitter.split('edinburgh_with_xy_sprite')
        self.assertEqual(place.id, 'edinburgh_with_xy_sprite')
        self.assertEqual(place.sprite, Sprite(image=transparent_image))
        self.assertEqual(len(place.pieces), 1)
        self.assertEqual(place.pieces[0],
                         Piece(id='edinburgh_with_xy_sprite_1',
                               bitmap_image=BitmapImage(
                                   x=0,
                                   y=0,
                                   width=77,
                                   height=131,
                                   sprite_offset=SpriteOffset(x=1350, y=200))))

    def test_roundtrip_through_load_and_save(self):
        layout_registry = LayoutRegistry.from_dir("tests/no_layouts")
        input_dir_name = 'tests/precomputed'
        place_id = 'edinburgh'
        with tempfile.TemporaryDirectory() as temp_dir_name:
            splitter = PreComputedLookupSplitter.from_dir(input_dir_name,
                                                          layout_registry,
                                                          has_background=True)
            place_before = splitter.split(place_id)

            PreComputedLookupSplitter.save_to_dir(place_before, temp_dir_name)

            splitter_after = \
                PreComputedLookupSplitter.from_dir(temp_dir_name,
                                                   layout_registry)
            place_after = splitter_after.split(place_id)

            self.assertEqual(place_before, place_after)

    @staticmethod
    def idsOf(place):
        return list(map(lambda p: p.id, place.pieces))


if __name__ == '__main__':
    unittest.main()
