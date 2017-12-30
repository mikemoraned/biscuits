import fnmatch
import glob
import re
import json

from schema import Piece, BitmapImage

DUMMY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF" \
            "cSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="


class PreComputedLookupSplitter:
    def __init__(self, dir_name, place_ids):
        self.dir_name = dir_name
        self.place_ids = place_ids

    @classmethod
    def from_dir(cls, dir_name):
        return PreComputedLookupSplitter(dir_name,
                                         list(cls.place_ids_in_dir(dir_name)))

    def split(self, place_id):
        if place_id in self.place_ids:
            pieces = self.load_pieces_from_file(place_id)
            return list([Piece(id="{}_{}".format(place_id, index),
                               bitmap_image=BitmapImage(
                                   data=DUMMY_PNG,
                                   x=entry['x'],
                                   y=entry['y'],
                                   width=entry['width'],
                                   height=entry['height'])
                               ) for index, entry in enumerate(pieces)])
        else:
            []

    def load_pieces_from_file(self, place_id):
        with open("{}/{}.labels.json".format(self.dir_name, place_id)) as file:
            return json.load(file)

    @classmethod
    def place_ids_in_dir(cls, dir_name):
        for file in glob.glob("./{}/*.labels.json".format(dir_name)):
            match = re.search("./{}/(.+).labels.json".format(dir_name), file)
            if match:
                yield match.group(1)
