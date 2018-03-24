import graphene

from schema.layout import Layout
from schema.piece import Piece
from schema.sprite import Sprite


class Place(graphene.ObjectType):
    id = graphene.ID()
    sprite = graphene.Field(Sprite)
    pieces = graphene.Field(graphene.List(Piece))
    layouts = graphene.Field(graphene.List(Layout))

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.id == other.id \
                   and self.sprite == other.sprite \
                   and self.pieces == self.pieces \
                   and self.layouts == self.layouts
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Place(id={},sprite={},pieces={},layouts={})".format(
            self.id, self.sprite, self.pieces, self.layouts
        )
