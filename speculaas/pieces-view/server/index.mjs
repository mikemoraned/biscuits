import express from 'express';
import proxy from 'http-proxy-middleware';
import fetch from 'isomorphic-fetch';

const app = express();

const port = process.argv[2];
const graphqlServerUrl = process.argv[3];

const graphqlContactable = (serverURL, context) => new Promise((resolve, reject) => {
  const logPrefix = `graphql (${context})`;
  const headers = new Headers();
  headers.append("Accept", "text/html")
  const healthcheckURL = serverURL + "graphql";
  fetch(healthcheckURL, { headers }).then((response) => {
    if (response.ok) {
      const message = `${logPrefix}: OK, URL: ${healthcheckURL}`;
      resolve(message);
    }
    else {
      const message = `${logPrefix}: non OK status, ${response.status}, URL: ${healthcheckURL}`;
      reject(message);
    }
  }).catch((error) => {
    const message = `${logPrefix}: Error, URL: ${healthcheckURL}, error: ${error}`;
    reject(message);
  });
});

const healthcheckResponse = (promise, response, resultForSuccess) => {
  promise
    .then((message) => {
      console.log(message);
      response.send(resultForSuccess);
    })
    .catch((message) => {
      console.error(message);
      response.status(500).send(message);
    });
};

app.use('/graphql', proxy({target: graphqlServerUrl, changeOrigin: true}));
app.get('/healthcheck/alive', (req, res) => {
  healthcheckResponse(graphqlContactable(graphqlServerUrl, "liveness"), res, "Alive");
});
app.get('/healthcheck/ready', (req, res) => {
  healthcheckResponse(graphqlContactable(graphqlServerUrl, "readyness"), res, "Ready");
});
app.use('/', express.static('../build'));

app.listen(port, () => {
  console.log('listening on: ', port);
  console.log('graphql server: ', graphqlServerUrl);
});