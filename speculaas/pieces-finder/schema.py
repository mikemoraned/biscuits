import graphene


class BitmapImage(graphene.ObjectType):
    data = graphene.String()
    x = graphene.Int()
    y = graphene.Int()
    width = graphene.Int()
    height = graphene.Int()

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.data == other.data \
                   and self.x == other.x \
                   and self.y == other.y \
                   and self.width == other.width \
                   and self.height == other.height
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "BitmapImage(data={},x={},y={},width={},height={})".format(
            self.data, self.x, self.y, self.width, self.height
        )


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


class Query(graphene.ObjectType):
    pieces_by_place_id = graphene.Field(graphene.List(Piece),
                                        id=graphene.String())

    def resolve_pieces_by_place_id(self, info, id):
        return self.split(id)


schema = graphene.Schema(query=Query)
