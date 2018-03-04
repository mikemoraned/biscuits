class LayoutOffsetLookupFn():
    def __init__(self, layout_registry, place_id, piece_id):
        self.layout_registry = layout_registry
        self.place_id = place_id
        self.piece_id = piece_id

    def __call__(self, layout_id):
        return self.layout_registry.lookup_offset(self.place_id,
                                                  layout_id,
                                                  self.piece_id)