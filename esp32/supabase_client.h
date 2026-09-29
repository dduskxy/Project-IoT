#ifndef SUPABASE_CLIENT_H
#define SUPABASE_CLIENT_H

#include <Arduino.h>
#include <ArduinoJson.h>

void Supabase_SendSleepData(float temperature, float light);
String Supabase_FetchBuzzerStatus();

#endif
