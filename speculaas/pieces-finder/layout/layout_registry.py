from collections import defaultdict

from layout import Layout

import logging


class LayoutRegistry:

    def __init__(self, layout_summaries_for_place_id, layouts_for_place_id):
        self.layout_summaries_for_place_id = layout_summaries_for_place_id
        self.layouts_for_place_id = layouts_for_place_id

    def lookup_offset(self, place_id, layout_id, offset_id):
        if place_id in self.layouts_for_place_id:
            layout_for_layout_id = self.layouts_for_place_id[place_id]
            if layout_id in layout_for_layout_id:
                layout = layout_for_layout_id[layout_id]
                if offset_id in layout.offset_for_id:
                    return layout.offset_for_id[offset_id]

        return None

    def lookup_layout_summaries_for_place_id(self, place_id):
        if place_id in self.layout_summaries_for_place_id:
            return self.layout_summaries_for_place_id[place_id]
        else:
            return []

    @classmethod
    def from_dir(cls, dir_name):
        layouts = list(Layout.load_all_in_dir(dir_name))
        layouts_for_place_id = defaultdict(dict)
        layout_summaries_for_place_id = defaultdict(list)
        for layout in layouts:
            place_id = layout.summary.place_id
            layouts_for_place_id[place_id][layout.summary.id] = layout
            layout_summaries_for_place_id[place_id].append(layout.summary)

        logging.info("loaded {} layouts from {}".format(len(layouts),
                                                        dir_name))

        return LayoutRegistry(layout_summaries_for_place_id, layouts_for_place_id)
