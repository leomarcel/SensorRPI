#!/usr/bin/python3
import Adafruit_DHT
from datetime import datetime
# PIN Vert + Bleu Data Violet -
DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 2
NOW = datetime.now()
now = NOW.strftime("%d/%m/%Y %H:%M:%S")
print("Content-type: json; charset=utf-8\n")

humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)

if humidity is None and temperature is not None:
  res = '{"temperature": ' + str(round(temperature, 3)) + ', "humidity": ' + str(round(humidity, 3)) + ', "date":"' + now + '"}'
  print(res)
else:
  print('{"status": "error", "msg":"Failed to get DHT22 Reading", "date":"' + now + '"}')