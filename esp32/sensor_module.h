#ifndef SENSOR_MODULE_H
#define SENSOR_MODULE_H

void Sensor_Init();
float Sensor_Read();
bool Sensor_IsValid(float value);

#endif
