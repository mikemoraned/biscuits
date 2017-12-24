import graphene


class FeatureCollection(graphene.ObjectType):
    features = graphene.List(graphene.String)

    def resolve_features(self, info):
        return []


class Query(graphene.ObjectType):
    pieces = graphene.Field(FeatureCollection)

    def resolve_pieces(self, info):
        return FeatureCollection()


schema = graphene.Schema(query=Query)
