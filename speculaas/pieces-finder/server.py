import sys
from flask import Flask
from flask_graphql import GraphQLView
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import schema
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

precomputed_dir = sys.argv[1]
splitter = PreComputedLookupSplitter.from_dir(precomputed_dir)

@app.route('/healthcheck/alive')
def alive():
    return "Alive"


@app.route('/healthcheck/ready')
def ready():
    return "Ready"


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
