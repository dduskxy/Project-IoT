#include "device_status.h"
#include "led_controller.h"
#include "servo_controller.h"
#include "supabase_client.h"

void DeviceStatus_Report() {
    bool ledOn = LED_GetStatus();
    int servoPos = Servo_GetPosition();
    Supabase_UpdateStatus(ledOn, servoPos);
}
