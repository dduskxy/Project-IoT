#ifndef DEVICE_STATUS_H
#define DEVICE_STATUS_H

#include <Arduino.h>

// ฟังก์ชันเดิม
void DeviceStatus_Report();

// ฟังก์ชันใหม่ที่รับค่าไปส่ง
void DeviceStatus_ReportCached(int waterLevel, int battery);

#endif
