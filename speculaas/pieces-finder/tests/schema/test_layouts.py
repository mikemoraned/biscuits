import unittest
from collections import OrderedDict

from graphene.test import Client

from tests.dummy_splitter import DummySplitter
from schema import schema

unittest.util._MAX_LENGTH = 2000


class TestLayouts(unittest.TestCase):
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
                }
            ]
        }
        self.dummy_splitter = DummySplitter(self.dummy_pieces)

    def test_has_layout_named_sprite_layout(self):
        client = Client(schema)
        executed = client.execute('''
                                  { 
                                    placeById(id: "edinburgh") { 
                                      id
                                      layouts {
                                        id
                                        name
                                      }
                                    } 
                                  }''',
                                  root_value=self.dummy_splitter)

        expected = {
            'data': OrderedDict([
                ('placeById',
                 OrderedDict([
                     ('id', 'edinburgh'),
                     ('layouts', [
                         OrderedDict([
                             ('id', 'sprite_layout'),
                             ('name', 'Sprite Layout')
                         ])
                     ]),
                 ])
                 )])
        }
        self.assertEqual(executed, expected)

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
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(executed, expected)

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
                         ])
                     ])
                 ])
                 )])
        }
        self.assertEqual(executed, expected)


if __name__ == '__main__':
    unittest.main()
