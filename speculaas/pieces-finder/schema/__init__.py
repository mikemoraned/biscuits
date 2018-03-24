import graphene

from schema.query import Query

schema = graphene.Schema(query=Query)
