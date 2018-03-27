import graphene

from schema.layout_offset import LayoutOffset
from schema.sprite_offset import SpriteOffset


class BitmapImage(graphene.ObjectType):
    x = graphene.Int()
    y = graphene.Int()
    width = graphene.Int()
    height = graphene.Int()
    sprite_offset = graphene.Field(SpriteOffset)
    layout_offset = graphene.Field(LayoutOffset, id=graphene.String())

    def __init__(self, x, y, width, height, sprite_offset,
                 layout_offset_lookup=lambda: None):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.sprite_offset = sprite_offset
        self.layout_offset_lookup = layout_offset_lookup

    def resolve_layout_offset(self, info, id):
        if id == 'sprite_offset':
            return LayoutOffset(x=self.sprite_offset.x,
                                y=self.sprite_offset.y)
        else:
            return self.layout_offset_lookup(id)

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
        return "BitmapImage(x={},y={},width={},height={}," \
               "sprite_offset={})" \
            .format(self.x, self.y, self.width, self.height,
                    self.sprite_offset)
