import express from 'express';
import compression from 'compression';

const app = express();

const port = process.argv[2];

app.use(compression());

app.get('/healthcheck/alive', (req, res) => {
  res.status(200).send("Alive");
});
app.get('/healthcheck/ready', (req, res) => {
  res.status(200).send("Ready");
});
app.use('/', express.static('../build'));

app.listen(port, () => {
  console.log('listening on: ', port);
});