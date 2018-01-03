import graphene
import base64

class Sprite(graphene.ObjectType):
    data_url = graphene.String(name='dataURL')

    @classmethod
    def from_byte_stream(cls, byte_stream):
        encoded = base64.b64encode(byte_stream).decode('utf8')
        return Sprite(data_url="data:image/png;base64,{}".format(encoded))

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.data_url == other.data_url
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Sprite(data_url={})".format(
            self.data_url
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


class Query(graphene.ObjectType):
    place_by_id = graphene.Field(Place, id=graphene.String())

    def resolve_place_by_id(self, info, id):
        return self.split(id)


schema = graphene.Schema(query=Query)
