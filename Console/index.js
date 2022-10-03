const fetch = require('node-fetch');
const clc = require('cli-color');
const express = require("express");
const http = require('http');

const DISPLAYCONSOLE = false;
const LAUNCHAPI = true;
const TIMEDISPLAY = 20;
const TIMEFETCH = 1000;
const LIMITWORKERMAX = 10; //false = unlimited
const LIMITWORKERWARN = LIMITWORKERMAX - LIMITWORKERMAX / 4;
const URL = "http://192.168.0.50:8888/humidity.py";
const LANG = 'FR';

const app = express();
const router = express.Router();
const PORT = 4000;

let nbErr = 0;
let nbWorker = 0;
let lastData = "";

function setTerminalTitle(title)
{
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
  );
}

function getTime() {
  let date = new Date();
  return date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
}

function print(data){
  console.clear();
  console.log(data);
}

async function getData() {
  try {
    return await fetch(URL).then(res => res.json());
  } catch (e) {
    return false;
  }
}

function launchGetData(){
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

function displayData(){
  setInterval(() => {
    let data = "";
    if (LIMITWORKERMAX === 0) data += clc.yellow("Impossible d'intitier une requête, le nombre de worker est configurer sur 0. Merci de configurer LIMITWORKERMAX à false, ou à un nombre supérieur à 0.\n\n");
    else if (!lastData && !nbErr) data += clc.bold("Connexion au serveur...\n\n"); 
    data +=
      "🌡  Température : " + clc.green((lastData ? lastData.temperature + "°C" : "N/A")) + "\n" +
      "💧 Humidité : " + clc.green((lastData ? lastData.humidity + "%" : "N/A")) + "\n" +
      // "🗓  Date : " + clc.green((lastData ? lastData.Date : "N/A")) + "\n" +
      "\n" + clc.bold("Info :\n\n") +
      clc.blueBright(nbErr) + " error(s) occured \n" +
      (nbWorker < LIMITWORKERWARN ? clc.magenta(nbWorker) : clc.red(nbWorker)) + " worker(s) \n" +
      "date : " + getTime() + "\n" + 
      "refresh time : " + TIMEFETCH + "ms\n";
      // (nbWorker >= LIMITWORKERWARN ? clc.yellow("\n\nAttention, le nombre de worker est élever. \nIl est possible que le serveur ne réponde pas. \nLa configuration peut être mauvaise.") : "");

    print(data);
  }, TIMEDISPLAY);


  get = (req, res, next) => {

    res.status(400).json({
    "temperature": 25.8,
    "humidity": 38
    });
  };

  router.post("/", get);

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
  app.use("/", colsRoutes);

function API(){
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
  const port = normalizePort(process.env.PORT || '4000');
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
  
  server.listen(port);  
}

function main() {
  setTerminalTitle("Sensor API");
  launchGetData();
  if(LAUNCHAPI) API();
  if(DISPLAYCONSOLE) displayData();
}

main();
