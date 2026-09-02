#include <Arduino.h>
#include "servo_controller.h"
#include "config.h"

// Note: Consider using ESP32Servo library in actual implementation
int currentAngle = 0;

void Servo_Init() {
    pinMode(SERVO_PIN, OUTPUT);
    Servo_SetPosition(0);
}

void Servo_SetPosition(int angle) {
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;
    currentAngle = angle;
    // Dummy PWM write
    analogWrite(SERVO_PIN, map(angle, 0, 180, 0, 255));
}

int Servo_GetPosition() {
    return currentAngle;
}
