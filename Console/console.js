const fetch = require('node-fetch');
const clc = require('cli-color');

const TIMEDISPLAY = 20;
const TIMEFETCH = 1000;
const LIMITWORKERMAX = 50; //false = unlimited
const LIMITWORKERWARN = LIMITWORKERMAX - LIMITWORKERMAX / 4;
const URL = "http://192.168.0.50:8888/humidity.py";

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
      }).catch(e => {
        lastData = {"status": "error", "msg": "Error Fetch " + JSON.stringify(e)};
      });
    }
  }, TIMEFETCH);
}

function displayData(){
  setInterval(() => {
    let data = "";
    let error = false;
    if (LIMITWORKERMAX === 0) data += clc.yellow("Impossible d'intitier une requête, le nombre de worker est configurer sur 0. Merci de configurer LIMITWORKERMAX à false, ou à un nombre supérieur à 0.\n\n");
    else if (!lastData && !nbErr) data += clc.bold("Connexion au serveur...\n\n"); 
    
    if (lastData.status == "error") {
      error = true;
      data += clc.magenta("⛔ Error Sensor : " + lastData.msg + "\n\n");
    } else error = false;

    data +=
      "🌡  Température : " + clc.green((lastData.temperature && !error ? lastData.temperature + "°C" : "N/A")) + "\n" +
      "💧 Humidité : " + clc.green((lastData.humidity && !error ? lastData.humidity + "%" : "N/A")) + "\n" +
      "🗓  Date : " + clc.green((lastData.date ? lastData.date : "N/A")) + "\n" +
      "\n" + clc.bold("Info :\n\n") +
      clc.blueBright(nbErr) + " error(s) occured \n" +
      (nbWorker < LIMITWORKERWARN ? clc.magenta(nbWorker) : clc.red(nbWorker)) + " worker(s) \n" +
      "date : " + getTime() + "\n" + 
      "refresh time : " + TIMEFETCH + "ms\n";
      // (nbWorker >= LIMITWORKERWARN ? clc.yellow("\n\nAttention, le nombre de worker est élever. \nIl est possible que le serveur ne réponde pas. \nLa configuration peut être mauvaise.") : "");

    print(data);
  }, TIMEDISPLAY);
}

function main() {
  setTerminalTitle("Sensor API");
  launchGetData();
  displayData();
}

main();
