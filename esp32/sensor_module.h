#ifndef SENSOR_MODULE_H
#define SENSOR_MODULE_H

#include <Arduino.h>

void Sensor_Init();
float SoilMoisture_Read();
int WaterLevel_Read();
int Battery_Read();

#endif // SENSOR_MODULE_H
