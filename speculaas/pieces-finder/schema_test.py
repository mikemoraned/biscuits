import unittest
from graphene.test import Client
from schema import schema


class TestSchema(unittest.TestCase):

    def test_hello(self):
        client = Client(schema)
        executed = client.execute('''{ hello }''')
        self.assertEqual(executed, {
            'data': {
                'hello': 'Hello stranger'
            }
        })


if __name__ == '__main__':
    unittest.main()
