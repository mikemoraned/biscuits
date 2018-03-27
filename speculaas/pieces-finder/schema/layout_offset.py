import graphene


class LayoutOffset(graphene.ObjectType):
    id = graphene.ID()
    x = graphene.Int()
    y = graphene.Int()

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            return self.x == other.x \
                   and self.y == other.y
        return False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return "LayoutOffset(x={},y={})".format(
            self.x, self.y
        )
