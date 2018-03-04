import graphene

from schema.layout_summary import LayoutSummary
from schema.piece import Piece
from schema.sprite import Sprite


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
