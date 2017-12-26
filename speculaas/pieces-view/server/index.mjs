import express from 'express';
import proxy from 'http-proxy-middleware';

const app = express();

const port = process.argv[2];
const graphqlServerUrl = process.argv[3];

app.use('/graphql', proxy({target: graphqlServerUrl, changeOrigin: true}));
app.get('/healthcheck/alive', (req, res) => res.send("Alive"));
app.get('/healthcheck/ready', (req, res) => res.send("Ready"));
app.use('/', express.static('../build'));

app.listen(port, () => {
    console.log('listening on: ', port);
    console.log('graphql server: ', graphqlServerUrl);
});