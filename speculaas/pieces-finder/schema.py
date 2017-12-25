import graphene


class BitmapImage(graphene.ObjectType):
    data = graphene.String()
    x = graphene.Int()
    y = graphene.Int()
    width = graphene.Int()
    height = graphene.Int()


class Piece(graphene.ObjectType):
    id = graphene.ID()
    bitmapImage = graphene.Field(BitmapImage)


class Query(graphene.ObjectType):
    pieces = graphene.List(Piece)

    def resolve_pieces(self, info):
        return info.context.get('splitter').split()


schema = graphene.Schema(query=Query)
