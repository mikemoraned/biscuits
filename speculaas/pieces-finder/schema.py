import graphene


class Piece(graphene.ObjectType):
    id = graphene.ID()

    def resolve_id(self, info):
        return self.id

class Query(graphene.ObjectType):
    pieces = graphene.List(Piece)

    def resolve_pieces(self, info):
        return info.context.get('splitter').split()


schema = graphene.Schema(query=Query)
