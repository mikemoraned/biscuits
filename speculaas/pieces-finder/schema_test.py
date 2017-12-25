import unittest
from collections import OrderedDict

from graphene.test import Client

from schema import schema
from splitter import DummySplitter

unittest.util._MAX_LENGTH = 2000


class TestSchema(unittest.TestCase):
    def __init__(self, method_name):
        super().__init__(method_name)
        self.maxDiff = None

    def test_full(self):
        client = Client(schema)
        dummy_pieces = [
            {
                "x": 10,
                "y": 20,
                "height": 882,
                "width": 1350
            }
        ]
        executed = client.execute('''
                                  { 
                                    pieces { 
                                      id
                                      bitmapImage {
                                        data
                                        x
                                        y
                                        width
                                        height
                                      }
                                    } 
                                  }''',
                                  root_value=DummySplitter(dummy_pieces))
        expected = {
            'data': OrderedDict([
                ('pieces', [
                    OrderedDict([
                        ('id', '0'),
                        ('bitmapImage', OrderedDict([
                            (
                            'data', "data:image/png;base64,iVBORw0KGgoAAAANSUh"
                                    "EUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
                                    "YPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="),
                            ('x', 10),
                            ('y', 20),
                            ('width', 1350),
                            ('height', 882)]
                        ))
                    ])
                ])
            ])
        }
        self.assertEqual(executed, expected)


if __name__ == '__main__':
    unittest.main()

