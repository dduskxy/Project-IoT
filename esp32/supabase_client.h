#ifndef SUPABASE_CLIENT_H
#define SUPABASE_CLIENT_H

#include <Arduino.h>
#include <ArduinoJson.h>

void Supabase_SendSensorData(float moisture);
void Supabase_UpdateStatus(bool ledOn, bool pumpOn, int waterLevel, int battery);
String Supabase_FetchCommand();
void Supabase_UpdateCommandStatus(String commandId, String status);

#endif
