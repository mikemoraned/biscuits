import express from 'express';
import proxy from 'http-proxy-middleware';
import fetch from 'isomorphic-fetch';

const app = express();

const port = process.argv[2];
const graphqlServerUrl = process.argv[3];

const graphqlContactable = (serverURL) => new Promise((resolve, reject) => {
  const headers = new Headers();
  headers.append("Accept", "text/html")
  const healthcheckURL = serverURL + "graphql";
  fetch(healthcheckURL, { headers }).then((response) => {
    if (response.ok) {
      const message = `graphql: OK, URL: ${healthcheckURL}`;
      resolve(message);
    }
    else {
      const message = `graphql: non OK status, ${response.status}, URL: ${healthcheckURL}`;
      reject(message);
    }
  }).catch((error) => {
    const message = `graphql: Error, URL: ${healthcheckURL}`;
    reject(message);
  });
});

app.use('/graphql', proxy({target: graphqlServerUrl, changeOrigin: true}));
app.get('/healthcheck/alive', (req, res) => res.send("Alive"));
app.get('/healthcheck/ready', (req, res) => {
  graphqlContactable(graphqlServerUrl)
    .then((message) => {
      console.log(message);
      res.send("Ready");
    })
    .catch((message) => {
      console.error(message);
      res.status(500).send(message);
    })
});
app.use('/', express.static('../build'));

app.listen(port, () => {
  console.log('listening on: ', port);
  console.log('graphql server: ', graphqlServerUrl);
});