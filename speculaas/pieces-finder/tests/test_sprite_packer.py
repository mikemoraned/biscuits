import tempfile
import unittest

from image_signature import signature
from layout.empty_layout_registry import EmptyLayoutRegistry
from precomputed_lookup_splitter import PreComputedLookupSplitter
from layout.sprite_packer import SpritePacker
from layout.layout_generator import LayoutGenerator

unittest.util._MAX_LENGTH = 2000


class TestSpritePacker(unittest.TestCase):
    def __init__(self, method_name):
        super().__init__(method_name)
        self.maxDiff = None

    def test_sprite_bytes_are_identical(self):
        input_dir_name = 'tests/precomputed'
        place_id = 'edinburgh_real'
        with tempfile.TemporaryDirectory() as packed_dir_name:
            packer = SpritePacker(input_dir_name, packed_dir_name,
                                  input_dir_has_background=True,
                                  layout_generator=LayoutGenerator())
            packer.pack(place_id)
            input_content = self.sprite_content(place_id, input_dir_name,
                                                has_background=True)
            packed_content = self.sprite_content(place_id, packed_dir_name,
                                                 has_background=False)
            self.assertListEqual(input_content, packed_content)

    def test_sprite_content_equal(self):
        input_dir_name = 'tests/precomputed'
        edinburgh = self.sprite_content('edinburgh_real', input_dir_name,
                                        has_background=True)
        edinburgh_same = self.sprite_content('edinburgh_real', input_dir_name,
                                             has_background=True)
        self.assertEqual(edinburgh, edinburgh_same)
        budapest = self.sprite_content('budapest', input_dir_name,
                                       has_background=True)
        self.assertNotEqual(edinburgh, budapest)

    @staticmethod
    def sprite_content(place_id, dir_name, has_background):
        splitter = \
            PreComputedLookupSplitter.from_dir(dir_name,
                                               layout_registry=
                                               EmptyLayoutRegistry(),
                                               has_background=has_background)
        place = splitter.split(place_id)

        def summary(id, bitmap_image):
            image = place.sprite.extract(bitmap_image)
            return (id,
                    bitmap_image.x, bitmap_image.y,
                    bitmap_image.width, bitmap_image.height,
                    signature(image))

        return list(sorted([summary(p.id, p.bitmap_image)
                            for p in place.pieces],
                           key=lambda s: s[0]))


if __name__ == '__main__':
    unittest.main()
