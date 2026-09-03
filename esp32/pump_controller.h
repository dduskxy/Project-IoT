#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

void Pump_Init();
void Pump_Set(bool on);
bool Pump_GetState();
void Pump_Maintain(); // For non-blocking PWM ramp up

#endif // PUMP_CONTROLLER_H
