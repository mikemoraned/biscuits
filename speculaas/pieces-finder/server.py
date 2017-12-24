from flask import Flask
from flask_graphql import GraphQLView
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import schema

app = Flask(__name__)
app.debug = True

splitter = PreComputedLookupSplitter.from_dir('./precomputed')

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        root_value=splitter,
        graphiql=True
    )
)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
