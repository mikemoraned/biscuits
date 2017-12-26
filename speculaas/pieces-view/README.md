# Build

    docker build -t speculaas-pieces-view .
    
# Run

    docker run -it -p 3000:3000 \
    -e GRAPHQL_URL='http://localhost:5000/graphql' \
    --rm --name speculaas-pieces-view-app speculaas-pieces-view
