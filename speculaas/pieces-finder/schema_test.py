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
        executed = client.execute('''
                                  { 
                                    pieces { 
                                      id
                                    } 
                                  }''',
                                  context_value={
                                      'splitter': DummySplitter()
                                  })
        expected = {
            'data': OrderedDict([
                ('pieces', [
                    OrderedDict([
                        ('id', '0')
                    ])
                ])
            ])
        }
        self.assertEqual(executed, expected)


if __name__ == '__main__':
    unittest.main()
