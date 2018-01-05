import logging
import sys
from flask import Flask
from flask_graphql import GraphQLView
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import schema
from flask_cors import CORS

from splitter_cache import SplitterCache

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

precomputed_dir = sys.argv[1]
splitter = SplitterCache(PreComputedLookupSplitter.from_dir(precomputed_dir))
pre_cache_completed = False


@app.route('/healthcheck/alive')
def alive():
    return "Alive"


@app.route('/healthcheck/ready')
def ready():
    splitter.pre_cache_all_place_ids()
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
