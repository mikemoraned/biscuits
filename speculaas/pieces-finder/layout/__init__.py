import glob
import json
import logging

from layout.layout_parameters import LayoutParameters
from schema.layout_offset import LayoutOffset
from schema.layout_summary import LayoutSummary


class Layout:

    def __init__(self, summary, parameters, bounds, offset_for_id):
        self.summary = summary
        self.parameters = parameters
        self.bounds = bounds
        self.offset_for_id = offset_for_id

    def save_to_dir(self, dir_name):
        json_serializable = {
            'summary': {
                'id': self.summary.id,
                'name': self.summary.name,
                'place_id': self.summary.place_id
            },
            'bounds': self.bounds,
            'parameters': self.parameters.to_json(),
            'offset_for_id': self.json_serializable_offset_for_id()
        }
        json_file_name = "{}/{}_{}.layout.json" \
            .format(dir_name,
                    self.summary.place_id,
                    self.parameters.filename_safe_short_name())
        with open(json_file_name, 'w') as out:
            json.dump(json_serializable, out, indent=True, sort_keys=True)
        logging.info(
            "saved {} pieces to {}".format(self.summary.name, json_file_name))

    @classmethod
    def load_all_in_dir(cls, dir_name):
        for file_name in glob.glob("{}/*.layout.json".format(dir_name)):
            with open(file_name) as file:
                yield cls.load_from_json(json.load(file))

    @classmethod
    def load_from_json(cls, json):
        summary = LayoutSummary(id=json['summary']['id'],
                                place_id=json['summary']['place_id'],
                                name=json['summary']['name'])

        return Layout(summary=summary,
                      bounds=json['bounds'],
                      parameters=
                      LayoutParameters.from_json(json['parameters']),
                      offset_for_id=
                      cls.offset_for_id_from_json(json['offset_for_id']))

    @classmethod
    def offset_for_id_from_json(cls, json):
        offset_for_id = dict()
        for id, json_offset in json:
            offset = LayoutOffset(id=id, x=json_offset['x'], y=json_offset['y'])
            offset_for_id[id] = offset
        return offset_for_id

    def json_serializable_offset_for_id(self):
        flattened = list()
        for id in sorted(self.offset_for_id.keys()):
            offset = self.offset_for_id[id]
            flattened.append((id,
                              {
                                  'x': offset.x,
                                  'y': offset.y,
                              }))
        return flattened
