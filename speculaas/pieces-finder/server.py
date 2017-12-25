from flask import Flask
from flask_graphql import GraphQLView
from schema import schema
from splitter import DummySplitter

app = Flask(__name__)
app.debug = True

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        root_value=DummySplitter([]),
        graphiql=True
    )
)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
