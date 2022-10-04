//node --insecure-http-parser server.js
//pm2 start server.js --node-args="--insecure-http-parser"

const fetch = require('node-fetch');
const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');

const TIMEFETCH = 1000;
const LIMITWORKERMAX = 10; //false = unlimited
const URL = "http://192.168.0.50:8888/humidity.py";

const app = express();
const PORT = 4000;

let nbErr = 0;
let nbWorker = 0;
let lastData = "";

async function getData() {
  try {
    return await fetch(URL).then(res => res.json());
  } catch (e) {
    return false;
  }
}

function launchGetData() {
  setInterval(() => {
    if (nbWorker < LIMITWORKERMAX) {
      nbWorker++;
      getData().then(res => {
        nbWorker--;
        if (!res) nbErr++;
        else lastData = res;
      });
    }
  }, TIMEFETCH);
}


get = (req, res, next) => {
  let data = {
    "temperature": lastData.temperature,
    "humidity": lastData.humidity,
    "date": lastData.date
  };
  console.log(data);
  res.status(400).json(data);
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());
app.use("/", get);

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(PORT);
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

launchGetData();
server.listen(port);  
