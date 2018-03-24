import graphene


class Layout(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.id == other.id \
                   and self.id == other.id \
                   and self.name == self.name
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "Layout(id={},name={}".format(
            self.id, self.name
        )
