#include "sensor_module.h"
#include "config.h"
#include <math.h>
#include <ChainableLED.h>

#define NUM_LEDS 1
ChainableLED rgbLed(RGB_CLK_PIN, RGB_DAT_PIN, NUM_LEDS);

void Sensor_Init() {
    pinMode(TEMP_PIN, INPUT);
    pinMode(LIGHT_PIN, INPUT);
}

void Buzzer_Init() {
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW); // Default OFF
    Serial.println("Buzzer initialized (OFF).");
}

void Buzzer_Set(bool isOn) {
    if (isOn) {
        analogWrite(BUZZER_PIN, 2); 
    } else {
        analogWrite(BUZZER_PIN, 0);
    }
}

void RGB_Init() {
    RGB_Off();
    Serial.println("RGB LED initialized (OFF).");
}

void RGB_SetColor(uint8_t r, uint8_t g, uint8_t b) {
    rgbLed.setColorRGB(0, r, g, b);
}

void RGB_Off() {
    rgbLed.setColorRGB(0, 0, 0, 0);
}

float Temperature_Read() {
    int rawValue = analogRead(TEMP_PIN);
    float voltage = rawValue * (3.3 / 4095.0);
    if (voltage == 0) return 25.0; 
    float r_ntc = (3.3 * 10000.0 / voltage) - 10000.0;
    float steinhart = r_ntc / 10000.0;     
    steinhart = log(steinhart);            
    steinhart /= 3950.0;                   
    steinhart += 1.0 / (25.0 + 273.15);    
    steinhart = 1.0 / steinhart;           
    steinhart -= 273.15;                   
    return steinhart;
}

float Light_Read() {
    int rawValue = analogRead(LIGHT_PIN);
    float percentage = (rawValue / 4095.0) * 100.0;
    return percentage;
}
