FROM node:9.3.0

# expected context
ENV PORT 3000

# Prepare app directory
RUN mkdir -p /usr/src/app
ADD . /usr/src/app

# Install dependencies
WORKDIR /usr/src/app
RUN npm install && npm install -g serve

# Build the app
RUN npm run build

# Run the app
CMD serve -s build -p $PORT
EXPOSE $PORT

