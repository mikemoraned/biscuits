import base64
import io

import graphene
from PIL import Image
from image_signature import signature


class Sprite(graphene.ObjectType):
    data_url = graphene.String(name='dataURL')

    def __init__(self, image):
        self.image = image
        self.signature = signature(image)
        self.data_url = self.create_data_url(image)

    def resolve_data_url(self, info):
        return self.data_url

    @staticmethod
    def create_data_url(image):
        bytes_io = io.BytesIO()
        image.save(bytes_io, format='png', transparent=1)
        image_bytes = bytes_io.getvalue()
        encoded = base64.b64encode(image_bytes).decode('utf8')
        return "data:image/png;base64,{}".format(encoded)

    def extract(self, bitmap_image):
        box = (bitmap_image.sprite_offset.x,
               bitmap_image.sprite_offset.y,
               bitmap_image.sprite_offset.x + bitmap_image.width,
               bitmap_image.sprite_offset.y + bitmap_image.height)
        return self.image.crop(box)

    @classmethod
    def from_filename(cls, filename):
        image = Image.open(filename)
        return Sprite(image=image)

    def save_to_filename(self, filename):
        self.image.save(filename, format='png', transparent=1)

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.signature == other.signature
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Sprite(signature={})".format(
            self.signature
        )
