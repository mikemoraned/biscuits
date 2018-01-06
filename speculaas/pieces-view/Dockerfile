FROM node:9.3.0 as build

# Prepare app directory
RUN mkdir -p /usr/src/app
ADD . /usr/src/app

# Install dependencies
WORKDIR /usr/src/app
RUN npm install
RUN cd server && npm install

# Test
RUN CI=true npm test

# Build the app
RUN npm run build

FROM node:9.3.0
RUN mkdir -p /usr/src/app
COPY --from=build /usr/src/app /usr/src/app

# expected context
ENV PORT 3000
ENV GRAPHQL_URL ""

# Run the app
CMD cd server && node --experimental-modules index.mjs $PORT $GRAPHQL_URL
EXPOSE $PORT

