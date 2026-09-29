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

void RGB_Init();
void RGB_SetColor(uint8_t r, uint8_t g, uint8_t b);
void RGB_Off();

#endif // SENSOR_MODULE_H
