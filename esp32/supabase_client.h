#ifndef SUPABASE_CLIENT_H
#define SUPABASE_CLIENT_H
#include <Arduino.h>

void Supabase_SendSensorData(float value);
String Supabase_FetchCommand();
void Supabase_UpdateStatus(bool ledOn, int servoPos);
void Supabase_UpdateCommandStatus(String commandId, String status);

#endif
