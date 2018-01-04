import base64

import graphene
import io
from PIL import Image
from image_signature import signature


class Sprite(graphene.ObjectType):
    data_url = graphene.String(name='dataURL')

    def __init__(self, image):
        self.image = image
        self.signature = signature(image)

    def resolve_data_url(self, info):
        bytes_io = io.BytesIO()
        self.image.save(bytes_io, format='png', transparent=1)
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


class SpriteOffset(graphene.ObjectType):
    x = graphene.Int()
    y = graphene.Int()

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.x == other.x \
                   and self.y == other.y
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "SpriteOffset(x={},y={})".format(
            self.x, self.y
        )


class BitmapImage(graphene.ObjectType):
    x = graphene.Int()
    y = graphene.Int()
    width = graphene.Int()
    height = graphene.Int()
    sprite_offset = graphene.Field(SpriteOffset)

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.x == other.x \
                   and self.y == other.y \
                   and self.width == other.width \
                   and self.height == other.height \
                   and self.sprite_offset == other.sprite_offset
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "BitmapImage(x={},y={},width={},height={},sprite_offset={})" \
            .format(self.x, self.y, self.width, self.height,
                    self.sprite_offset)


class Piece(graphene.ObjectType):
    id = graphene.ID()
    bitmap_image = graphene.Field(BitmapImage)

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.id == other.id \
                   and self.bitmap_image == other.bitmap_image
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Piece(id={},bitmap_image={})".format(
            self.id, self.bitmap_image
        )


class Place(graphene.ObjectType):
    id = graphene.ID()
    sprite = graphene.Field(Sprite)
    pieces = graphene.Field(graphene.List(Piece))

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.id == other.id \
                   and self.sprite == other.sprite \
                   and self.pieces == self.pieces
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Place(id={},sprite={},pieces={})".format(
            self.id, self.sprite, self.pieces
        )


class Query(graphene.ObjectType):
    place_by_id = graphene.Field(Place, id=graphene.String())

    def resolve_place_by_id(self, info, id):
        return self.split(id)


schema = graphene.Schema(query=Query)
