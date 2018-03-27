import logging
import threading
from math import sqrt

import sys
from rectpack import newPacker

from layout import Layout
from layout.empty_layout_registry import EmptyLayoutRegistry
from layout.layout_parameters import LayoutParameters
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema.layout_offset import LayoutOffset
from schema.layout_summary import LayoutSummary
import multiprocessing as mp


class LayoutGenerator:

    def __init__(self, area_expansion=1.5):
        self.area_expansion = area_expansion

    def layout_from_pieces(self, place_id, pieces, parameters):

        area_expansion = self.area_expansion
        rect_list = list()
        while len(pieces) != len(rect_list):
            packer = self.prepare_packer(pieces, parameters, area_expansion)

            packer.pack()

            rect_list = packer.rect_list()

            logging.info("area_expansion: {}, {} pieces in, {} rects out"
                         .format(area_expansion, len(pieces), len(rect_list)))

            area_expansion *= 2

        bounds = self.find_min_bounds(rect_list)

        logging.info("{} rects, bounds={}".format(len(rect_list), bounds))

        rect_by_id = {}
        for rect in rect_list:
            (bin_count, x, y, width, height, rid) = rect
            rect_by_id[rid] = rect

        return Layout(summary=LayoutSummary(id=parameters.short_name(),
                                            place_id=place_id,
                                            name=parameters.short_name()),
                      bounds=bounds,
                      parameters=parameters,
                      offset_for_id=self.convert_to_layout_offset(pieces,
                                                                  parameters,
                                                                  rect_by_id))

    def prepare_packer(self, pieces, parameters, area_expansion):
        packer = newPacker(rotation=False,
                           bin_algo=parameters.bin_algorithm(),
                           pack_algo=parameters.pack_algorithm(),
                           sort_algo=parameters.sort_algorithm())
        area = 0
        for piece in pieces:
            packer.add_rect(width=piece.bitmap_image.width,
                            height=piece.bitmap_image.height,
                            rid=piece.id)
            area += piece.bitmap_image.width * piece.bitmap_image.height

        bin_area = area * area_expansion
        bin_side_length = int(sqrt(bin_area))
        logging.info("Using bin of size {} x {} = {}".format(bin_side_length,
                                                             bin_side_length,
                                                             bin_area))
        packer.add_bin(width=bin_side_length, height=bin_side_length)
        return packer

    @staticmethod
    def find_min_bounds(rect_list):
        def max_bounds(rect):
            (bin_count, x, y, width, height, rid) = rect
            return x + width, y + height

        first = rect_list[0]
        (max_width, max_height) = max_bounds(first)
        for rect in rect_list:
            (width, height) = max_bounds(rect)
            max_width = max(max_width, width)
            max_height = max(max_height, height)

        return max_width, max_height

    def convert_to_layout_offset(self, pieces, parameters, rect_by_id):
        offset_for_id = dict()
        for p in pieces:
            offset_for_id[p.id] = self.rect_to_layout_offset(parameters,
                                                             rect_by_id[p.id])
        return offset_for_id

    @staticmethod
    def rect_to_layout_offset(parameters, rect):
        (bin_count, x, y, width, height, rid) = rect
        return LayoutOffset(id=parameters.short_name(), x=x, y=y)


def generate_layout(layout_generator, place_id, pieces, parameters,
                    output_dir_name):
    logging.basicConfig(level=logging.INFO)
    try:
        layout = layout_generator.layout_from_pieces(place_id,
                                                     pieces,
                                                     parameters)
        layout.save_to_dir(output_dir_name)
    except Exception as e:
        logging.error("{},{} exception: {}".format(place_id,
                                                    parameters.short_name(),
                                                    e))
    except Error as e:
        logging.error("{},{} error: {}".format(place_id,
                                               parameters.short_name(),
                                               e))


if __name__ == '__main__':
    mp.set_start_method('spawn')

    input_dir_name = sys.argv[1]
    output_dir_name = sys.argv[2]
    place_ids = sys.argv[3].split(',')

    logging.basicConfig(level=logging.INFO)

    splitter = \
        PreComputedLookupSplitter.from_dir(input_dir_name,
                                           layout_registry=
                                           EmptyLayoutRegistry(),
                                           has_background=False)

    layout_generator = LayoutGenerator()
    for parameters in LayoutParameters.list_all():
        processes = list()
        for place_id in place_ids:
            place = splitter.split(place_id)
            processes.append(mp.Process(target=generate_layout,
                                        args=(layout_generator,
                                              place_id,
                                              place.pieces,
                                              parameters,
                                              output_dir_name)))

        for process in processes:
            process.start()
            logging.info("Started {}".format(process))

        for process in processes:
            process.join()
            logging.info("Process {} completed".format(process))
