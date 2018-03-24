import graphene

from schema.piece import Place


class Query(graphene.ObjectType):
    place_by_id = graphene.Field(Place, id=graphene.String())

    def resolve_place_by_id(self, info, id):
        return self.split(id)
