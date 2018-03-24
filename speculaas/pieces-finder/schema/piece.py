import graphene

from schema.bitmap_image import BitmapImage


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