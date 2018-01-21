import express from 'express';
import proxy from 'http-proxy-middleware';
import fetch from 'isomorphic-fetch';

const app = express();

const port = process.argv[2];
const graphqlServerUrl = process.argv[3];

app.use('/graphql', proxy({target: graphqlServerUrl, changeOrigin: true}));
app.get('/healthcheck/alive', (req, res) => res.send("Alive"));
app.get('/healthcheck/ready', (req, res) => {
    const headers = new Headers();
    headers.append("Accept", "text/html")
    const healthcheckURL = graphqlServerUrl + "graphql";
    fetch(healthcheckURL, { headers }).then((response) => {
      if (response.ok) {
        const message = `graphql: OK, URL: ${healthcheckURL}`;
        console.log(message);
        res.send("Ready");
      }
      else {
        const message = `graphql: non OK status, ${response.status}, URL: ${healthcheckURL}`;
        console.error(message);
        res.status(500).send(message);
      }
    }).catch((error) => {
      const message = `graphql: Error, URL: ${healthcheckURL}`;
      console.error(error);
      res.status(500).send(message);
    })
});
app.use('/', express.static('../build'));

app.listen(port, () => {
    console.log('listening on: ', port);
    console.log('graphql server: ', graphqlServerUrl);
});