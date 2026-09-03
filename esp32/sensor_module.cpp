#include "sensor_module.h"
#include "config.h"

// The 5 pins for the water level sensor (100%, 75%, 50%, 25%, 10%)
const int WATER_LEVEL_PINS[] = {13, 14, 27, 26, 25};
const int WATER_LEVEL_VALUES[] = {100, 75, 50, 25, 10};

void Sensor_Init() {
    pinMode(MOISTURE_POWER_PIN, OUTPUT);
    digitalWrite(MOISTURE_POWER_PIN, LOW); // Keep off by default to prevent corrosion
    
    pinMode(MOISTURE_SIGNAL_PIN, INPUT);
    pinMode(BATTERY_PIN, INPUT);
    pinMode(WATER_LEVEL_GROUND_PIN, INPUT); // Multi-level water sensor sense pin
    
    for (int i = 0; i < 5; i++) {
        pinMode(WATER_LEVEL_PINS[i], INPUT); // Keep as input until reading
    }
}

float SoilMoisture_Read() {
    // Power on sensor
    digitalWrite(MOISTURE_POWER_PIN, HIGH);
    delay(10); // Wait for sensor to stabilize
    
    int rawValue = analogRead(MOISTURE_SIGNAL_PIN);
    
    // Power off sensor to prevent corrosion
    digitalWrite(MOISTURE_POWER_PIN, LOW);
    
    // Map raw value to percentage (adjust these values based on calibration)
    // Assuming 0 is dry (4095) and 100 is wet (0) for typical analog sensors
    float percentage = map(rawValue, 4095, 0, 0, 100);
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    return percentage;
}

int WaterLevel_Read() {
    int level = 0;
    
    // Sequential reading of the water level pins
    for (int i = 0; i < 5; i++) {
        pinMode(WATER_LEVEL_PINS[i], OUTPUT);
        digitalWrite(WATER_LEVEL_PINS[i], HIGH);
        delay(10); // allow signal to propagate
        
        int reading = analogRead(WATER_LEVEL_GROUND_PIN);
        
        digitalWrite(WATER_LEVEL_PINS[i], LOW);
        pinMode(WATER_LEVEL_PINS[i], INPUT);
        
        // Threshold for detecting water connection
        if (reading > 1000) {
            level = WATER_LEVEL_VALUES[i];
            break; // Found the highest level
        }
    }
    
    return level;
}

int Battery_Read() {
    // Read battery voltage via voltage divider
    int raw = analogRead(BATTERY_PIN);
    
    // Convert raw ADC (0-4095) to percentage
    // E.g., 4.2V max (100%), 3.3V min (0%)
    // Adjust based on your specific voltage divider
    float voltage = (raw / 4095.0) * 3.3 * 2; // Assuming 1:1 divider
    
    int percentage = map(voltage * 100, 330, 420, 0, 100);
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    return percentage;
}
