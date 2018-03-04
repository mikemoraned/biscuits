class EmptyLayoutRegistry:

    def lookup_offset(self, place_id, layout_id, offset_id):
        return None

    def lookup_layout_summaries_for_place_id(self, place_id):
        return []
