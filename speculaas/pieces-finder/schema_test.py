import unittest
from graphene.test import Client
from schema import schema


class TestSchema(unittest.TestCase):

    def test_pieces(self):
        client = Client(schema)
        executed = client.execute('''{ pieces { features } }''')
        self.assertEqual(executed, {
            'data': {
                'pieces': {
                    'features': []
                }
            }
        })


if __name__ == '__main__':
    unittest.main()
