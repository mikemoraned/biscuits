import graphene


class LayoutSummary(graphene.ObjectType):
    id = graphene.ID()
    place_id = graphene.ID()
    name = graphene.String()

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.id == other.id \
                   and self.place_id == other.place_id \
                   and self.id == other.id \
                   and self.name == self.name
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "LayoutSummary(id={},place_id={},name={}".format(
            self.id, self.place_id, self.name
        )
