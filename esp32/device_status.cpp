#include "device_status.h"
#include "led_controller.h"
#include "pump_controller.h"
#include "supabase_client.h"

void DeviceStatus_Report() {
    bool ledOn = LED_GetStatus();
    bool pumpOn = Pump_GetState();
    // Default values if no sensor data is provided
    Supabase_UpdateStatus(ledOn, pumpOn, 100, 100);
}

void DeviceStatus_ReportCached(int waterLevel, int battery) {
    bool ledOn = LED_GetStatus();
    bool pumpOn = Pump_GetState();
    Supabase_UpdateStatus(ledOn, pumpOn, waterLevel, battery);
}
