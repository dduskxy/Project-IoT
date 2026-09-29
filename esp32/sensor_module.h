#ifndef SENSOR_MODULE_H
#define SENSOR_MODULE_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>

void Sensor_Init();
float Temperature_Read();
float Light_Read();

void Buzzer_Init();
void Buzzer_Set(bool isOn);

#endif // SENSOR_MODULE_H
