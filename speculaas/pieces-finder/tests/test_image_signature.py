import unittest

from image_signature import signature
from tests.images_for_tests import transparent_image


class TestSignature(unittest.TestCase):
    def test_transparent_png_signature(self):
        sig = signature(transparent_image)
        self.assertEqual('0b0b49a6089daffae6d2eb6ee4c5a815', sig)
