import unittest
from collections import OrderedDict

from graphene.test import Client

from layout import Layout, LayoutParameters
from layout.layout_registry import LayoutRegistry
from schema.layout_offset import LayoutOffset
from schema.layout_summary import LayoutSummary
from tests.dummy_splitter import DummySplitter
from schema import schema

unittest.util._MAX_LENGTH = 2000


class TestSchema(unittest.TestCase):
    def __init__(self, method_name):
        super().__init__(method_name)
        self.maxDiff = None
        self.dummy_pieces = {
            'edinburgh': [
                {
                    "x": 10,
                    "y": 20,
                    "height": 882,
                    "width": 1350,
                    "sprite_offset": 200
                },
                {
                    "x": 11,
                    "y": 21,
                    "height": 882,
                    "width": 1350,
                    "sprite_offset": 201
                }
            ]
        }
        layout_summary = LayoutSummary(id='layout_id',
                                       name='Some Layout',
                                       place_id='edinburgh')
        layout_registry = LayoutRegistry(
            layout_summaries_for_place_id={
                'edinburgh': layout_summary
            },
            layouts_for_place_id={
                'edinburgh': {
                    'layout_id': Layout(summary=layout_summary,
                                        parameters=LayoutParameters(),
                                        bounds=(1000, 1000),
                                        offset_for_id={
                                            'edinburgh_0': LayoutOffset(
                                                id='layout_id_edinburgh_0',
                                                x=13,
                                                y=22
                                            ),
                                            'edinburgh_1': LayoutOffset(
                                                id='layout_id_edinburgh_1',
                                                x=23,
                                                y=42
                                            )
                                        })
                }
            }
        )
        self.dummy_splitter = DummySplitter(self.dummy_pieces,
                                            layout_summaries=[layout_summary],
                                            layout_registry=layout_registry)

    def test_piecesByPlaceId_min_fields_for_unknown_id(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "glasgow") { 
                                      id
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)
        expected = {
            'data': OrderedDict([
                ('placeById', None)
            ])
        }
        self.assertEqual(expected, executed)

    def test_piecesByPlaceId_all_fields_for_known_id(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "edinburgh") { 
                                      id
                                      sprite {
                                        dataURL
                                      }
                                      pieces {
                                        id
                                        bitmapImage {
                                          x
                                          y
                                          width
                                          height
                                          spriteOffset {
                                            x
                                            y
                                          }
                                        }
                                      }
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)
        expected = {
            'data': OrderedDict([
                ('placeById',
                 OrderedDict([
                     ('id', 'edinburgh'),
                     ('sprite', OrderedDict([
                         ('dataURL', self.dummy_splitter.data_url)
                     ])),
                     ('pieces', [
                         OrderedDict([
                             ('id', 'edinburgh_0'),
                             ('bitmapImage', OrderedDict([
                                 ('x', 10),
                                 ('y', 20),
                                 ('width', 1350),
                                 ('height', 882),
                                 ('spriteOffset', OrderedDict([
                                     ('x', 200),
                                     ('y', 0)]
                                 ))
                             ]))
                         ]),
                         OrderedDict([
                             ('id', 'edinburgh_1'),
                             ('bitmapImage', OrderedDict([
                                 ('x', 11),
                                 ('y', 21),
                                 ('width', 1350),
                                 ('height', 882),
                                 ('spriteOffset', OrderedDict([
                                     ('x', 201),
                                     ('y', 0)]
                                 ))
                             ]))
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(expected, executed)

    def test_has_layout_offsets_for_sprite_layout(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "edinburgh") { 
                                      id
                                      pieces {
                                        id
                                        bitmapImage {
                                          layoutOffset(id: "sprite_offset") {
                                            x
                                            y
                                          }
                                        }
                                      }
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)

        expected = {
            'data': OrderedDict([
                ('placeById',
                 OrderedDict([
                     ('id', 'edinburgh'),
                     ('pieces', [
                         OrderedDict([
                             ('id', 'edinburgh_0'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', OrderedDict([
                                     ('x', 200),
                                     ('y', 0)]
                                 ))
                             ]))
                         ]),
                         OrderedDict([
                             ('id', 'edinburgh_1'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', OrderedDict([
                                     ('x', 201),
                                     ('y', 0)]
                                 ))
                             ]))
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(expected, executed)

    def test_has_layout_offsets_for_additional_layout(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "edinburgh") { 
                                      id
                                      pieces {
                                        id
                                        bitmapImage {
                                          layoutOffset(id: "layout_id") {
                                            x
                                            y
                                          }
                                        }
                                      }
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)

        expected = {
            'data': OrderedDict([
                ('placeById',
                 OrderedDict([
                     ('id', 'edinburgh'),
                     ('pieces', [
                         OrderedDict([
                             ('id', 'edinburgh_0'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', OrderedDict([
                                     ('x', 13),
                                     ('y', 22)]
                                 ))
                             ]))
                         ]),
                         OrderedDict([
                             ('id', 'edinburgh_1'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', OrderedDict([
                                     ('x', 23),
                                     ('y', 42)]
                                 ))
                             ]))
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(expected, executed)

    def test_returns_none_for_unknown_layout_id(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "edinburgh") { 
                                      id
                                      pieces {
                                        id
                                        bitmapImage {
                                          layoutOffset(id: "unknown") {
                                            x
                                            y
                                          }
                                        }
                                      }
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)

        expected = {
            'data': OrderedDict([
                ('placeById',
                 OrderedDict([
                     ('id', 'edinburgh'),
                     ('pieces', [
                         OrderedDict([
                             ('id', 'edinburgh_0'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', None)
                             ]))
                         ]),
                         OrderedDict([
                             ('id', 'edinburgh_1'),
                             ('bitmapImage', OrderedDict([
                                 ('layoutOffset', None)
                             ]))
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(expected, executed)


if __name__ == '__main__':
    unittest.main()
