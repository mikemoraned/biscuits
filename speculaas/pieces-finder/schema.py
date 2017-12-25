import graphene

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class BitmapImage(graphene.ObjectType):
    data = graphene.Field(graphene.String)
    x = graphene.Field(graphene.Int)
    y = graphene.Field(graphene.Int)
    width = graphene.Field(graphene.Int)
    height = graphene.Field(graphene.Int)


class Piece(graphene.ObjectType):
    bitmapImage = graphene.Field(BitmapImage)

    def resolve_bitmapImage(self, info):
        return BitmapImage(data=DUMMY_PNG, x=0, y=0, width=100, height=200)


class Query(graphene.ObjectType):
    pieces = graphene.Field(Piece)

    def resolve_pieces(self, info):
        return [Piece()]


schema = graphene.Schema(query=Query)
