
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/ChatUI';

export default function DashboardClient({ initialDeviceStatus, initialSensorData }: { initialDeviceStatus: any, initialSensorData: any[] }) {
  const [deviceStatus, setDeviceStatus] = useState<any>(initialDeviceStatus);
  const [sensorData, setSensorData] = useState<any[]>(initialSensorData);
  const [pendingDevices, setPendingDevices] = useState<Record<string, boolean>>({});
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  
  // Use state to ensure supabase client is only created once per component lifecycle
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Consolidate subscriptions into a single channel for better resource management
    const channel = supabase
      .channel('iot_dashboard_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_status', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        setDeviceStatus((prev: any) => ({ ...prev, ...payload.new }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        setSensorData(prev => [payload.new, ...prev].slice(0, 50)); // Keep only latest 50 records
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commands', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        if (payload.new.status === 'PENDING') {
          setPendingDevices(prev => ({ ...prev, [payload.new.device]: true }));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'commands', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        if (payload.new.status !== 'PENDING') {
          setPendingDevices(prev => ({ ...prev, [payload.new.device]: false }));
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleDevice = async (device: 'LED' | 'PUMP', newStatus: 'ON' | 'OFF') => {
    setPendingDevices(prev => ({ ...prev, [device]: true }));
    const { error } = await supabase
      .from('commands')
      .insert({
        device_id: 'esp32-device-01',
        device: device,
        command: newStatus,
        status: 'PENDING'
      });
      
    if (error) {
      alert(`Error sending ${device} command: ` + error.message);
      setPendingDevices(prev => ({ ...prev, [device]: false }));
    }
  };

  // Derive feeling from latest sensor data
  // Filter to only soil moisture readings for plant feeling
  const latestMoistureReading = sensorData?.find((d: any) => d.sensor_type === 'SOIL_MOISTURE');
  const latestMoisture = latestMoistureReading ? latestMoistureReading.value : null;
  
  let plantFeeling = "🤔 กำลังโหลดข้อมูล...";
  let feelingColor = "text-gray-500 bg-gray-50";
  
  if (latestMoisture !== null) {
    if (latestMoisture < 30) {
      plantFeeling = "🥵 หิวน้ำจังเลย (ดินแห้ง)";
      feelingColor = "text-orange-600 bg-orange-50 ring-orange-200";
    } else if (latestMoisture <= 70) {
      plantFeeling = "😊 สดชื่น อารมณ์ดี (ความชื้นกำลังดี)";
      feelingColor = "text-green-600 bg-green-50 ring-green-200";
    } else {
      plantFeeling = "🥶 น้ำเยอะไปแล้ว หายใจไม่ออก! (แฉะไป)";
      feelingColor = "text-blue-600 bg-blue-50 ring-blue-200";
    }
  }

  const isLedPending = pendingDevices['LED'];
  const isPumpPending = pendingDevices['PUMP'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Left Column: Status & Controls */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Feeling Card */}
          <div className="p-8 border rounded-2xl shadow-sm bg-white text-black flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
            <div className="w-full flex justify-end mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider">อารมณ์ของต้นไม้ 🪴</h2>
            <div className={`text-xl font-bold py-4 px-6 rounded-2xl ring-1 ${feelingColor}`}>
              {plantFeeling}
            </div>
            <div className="mt-6 flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl border">
              <span className="text-gray-500 font-medium">ความชื้นในดินปัจจุบัน</span>
              <span className="font-bold text-lg text-gray-800">{latestMoisture !== null ? `${latestMoisture.toFixed(1)}%` : 'ไม่มีข้อมูล'}</span>
            </div>
          </div>

          {/* Device Status Card */}
          <div className="p-8 border rounded-2xl shadow-sm bg-white text-black flex flex-col justify-center transition-all hover:shadow-md">
            <h2 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wider">Device Status</h2>
            <p className="text-sm text-gray-500 mb-4">Device ID: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">esp32-device-01</span></p>
            
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col p-3 border rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-500 mb-1">Battery Level 🔋</span>
                  <span className={`text-lg font-bold ${deviceStatus?.battery_level < 20 ? 'text-red-500' : 'text-green-600'}`}>
                    {deviceStatus?.battery_level !== undefined ? `${deviceStatus.battery_level}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col p-3 border rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-500 mb-1">Water Tank 💧</span>
                  <span className={`text-lg font-bold ${deviceStatus?.water_level < 20 ? 'text-red-500' : 'text-blue-600'}`}>
                    {deviceStatus?.water_level !== undefined ? `${deviceStatus.water_level}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                <span className="font-medium text-gray-700">LED Status</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${deviceStatus?.led_status === 'ON' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'bg-gray-200 text-gray-600'}`}>
                  {deviceStatus?.led_status || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                <span className="font-medium text-gray-700">Pump Status</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${deviceStatus?.pump_status === 'ON' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-gray-200 text-gray-600'}`}>
                  {deviceStatus?.pump_status || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Controls Card */}
        <div className="p-8 border rounded-2xl shadow-sm bg-white text-black transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wider">Quick Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            <div className="flex flex-col gap-3">
              <p className="text-gray-600 font-medium flex items-center justify-between gap-2">
                <span>💡 หลอดไฟ (แสงสังเคราะห์)</span>
                {isLedPending && <span className="text-xs text-yellow-600 animate-pulse font-bold">กำลังอัปเดต...</span>}
              </p>
              <div className="flex gap-3">
                <button 
                  disabled={isLedPending}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${deviceStatus?.led_status === 'ON' ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-100' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'} disabled:opacity-50`}
                  onClick={() => toggleDevice('LED', 'ON')}
                >
                  เปิด
                </button>
                <button 
                  disabled={isLedPending}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${deviceStatus?.led_status === 'OFF' ? 'bg-gray-800 text-white ring-4 ring-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}
                  onClick={() => toggleDevice('LED', 'OFF')}
                >
                  ปิด
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <p className="text-gray-600 font-medium flex items-center justify-between gap-2">
                <span>💧 ปั๊มน้ำ</span>
                {isPumpPending && <span className="text-xs text-blue-600 animate-pulse font-bold">กำลังอัปเดต...</span>}
              </p>
              <div className="flex gap-3">
                <button 
                  disabled={isPumpPending}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${deviceStatus?.pump_status === 'ON' ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'} disabled:opacity-50`}
                  onClick={() => toggleDevice('PUMP', 'ON')}
                >
                  เปิดปั๊มน้ำ
                </button>
                <button 
                  disabled={isPumpPending}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${deviceStatus?.pump_status === 'OFF' ? 'bg-gray-800 text-white ring-4 ring-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}
                  onClick={() => toggleDevice('PUMP', 'OFF')}
                >
                  ปิดปั๊มน้ำ
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Real-time Data Table Card */}
        <div className="p-8 border rounded-2xl shadow-sm bg-white text-black transition-all hover:shadow-md overflow-hidden">
          <h2 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wider flex items-center justify-between">
            <span>📡 Real-time Sensor Log</span>
            <span className="flex h-3 w-3 relative">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-3 font-semibold rounded-tl-lg">Time</th>
                  <th className="p-3 font-semibold">Sensor</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Value</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sensorData && sensorData.length > 0 ? (
                  sensorData.slice(0, 10).map((log, idx) => (
                    <tr key={log.id || idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleTimeString('th-TH')}</td>
                      <td className="p-3 font-medium text-gray-700">{log.sensor_type}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 font-bold px-2 py-1 rounded-md">
                          {log.value} {log.unit}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400 font-medium">ไม่มีข้อมูลเซ็นเซอร์</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Chat UI */}
      <div className="lg:col-span-1 h-full">
        <ChatUI />
      </div>

    </div>
  );
}


