#!/usr/bin/python3
import Adafruit_DHT
from datetime import datetime

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 2
NOW = datetime.now()
now = NOW.strftime("%d/%m/%Y %H:%M:%S")
print("Content-type: json; charset=utf-8\n")

#while True:
humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)

if humidity is not None and temperature is not None:
  #print("Temp={0:0.1f}*C  Humidity={1:0.1f}%".format(temperature, humidity))
  res = '{"Temperature":"' + str(round(temperature, 3)) + '°C", "Humidity":"' + str(round(humidity, 3)) + '%", "Date":"' + now + '"}'
  print(res)
else:
  print('{"Status": "error"}')