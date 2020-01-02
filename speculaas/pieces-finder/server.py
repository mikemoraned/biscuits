import logging
import sys
from flask import Flask
from flask_graphql import GraphQLView

from layout.layout_registry import LayoutRegistry
from precomputed_lookup_splitter import PreComputedLookupSplitter
from schema import schema
from flask_cors import CORS

from dotenv import load_dotenv
import os
import beeline
from beeline.middleware.flask import HoneyMiddleware

from splitter_cache import SplitterCache

import atexit


load_dotenv()

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
honeycomb_key = os.getenv("HONEYCOMB_KEY")
if honeycomb_key:
    logging.info("honeycomb: initializing")
    beeline.init(
        writekey=honeycomb_key, dataset="speculaas", service_name="pieces-finder"
    )
    HoneyMiddleware(app, db_events=False)
    logging.info("honeycomb: initialized")
else:
    logging.info("honeycomb: skipping")

precomputed_dir = sys.argv[1]
layout_dir = sys.argv[2]
layout_registry = LayoutRegistry.from_dir(layout_dir)
splitter = PreComputedLookupSplitter.from_dir(precomputed_dir, layout_registry)
splitter_cache = SplitterCache(splitter)
pre_cache_completed = False


@app.route("/healthcheck/alive")
def alive():
    return "Alive"


@app.route("/healthcheck/ready")
def ready():
    splitter_cache.pre_cache_all_place_ids()
    return "Ready"


def honeycomb_middleware(next, root, info, **args):
    with beeline.tracer(name="graphql_execute"):
        beeline.add_context(
            {
                "graphql.parent_type": root._meta.name
                if root and hasattr(root, "_meta")
                else "",
                "graphql.field_name": info.field_name,
                "graphql.args": args,
            }
        )
        return next(root, info, **args)


app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view(
        "graphql",
        schema=schema,
        root_value=splitter,
        graphiql=True,
        middleware=[honeycomb_middleware],
    ),
)

atexit.register(beeline.close)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
