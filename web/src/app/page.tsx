
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [llmCommand, setLlmCommand] = useState('');

  useEffect(() => {
    fetchDeviceStatus();
    fetchSensorData();
  }, []);

  const fetchDeviceStatus = async () => {
    const { data, error } = await supabase.from('device_status').select('*').single();
    if (!error) setDeviceStatus(data);
  };

  const fetchSensorData = async () => {
    const { data, error } = await supabase.from('sensor_data').select('*').order('timestamp', { ascending: false }).limit(5);
    if (!error) setSensorData(data);
  };

  const sendCommand = async (device: string, command: string, value: number = 0) => {
    await supabase.from('commands').insert([{ device_id: 'esp32-device-01', device, command, value }]);
    alert('Command sent');
  };

  const handleLlmSubmit = async () => {
    // Dummy LLM interaction: in a real scenario, you'd send llmCommand to a backend route that queries the LLM
    // Here we simulate it
    alert('Simulating LLM sending command for: ' + llmCommand);
    if (llmCommand.includes('เปิด')) {
       await sendCommand('LED', 'ON');
    } else if (llmCommand.includes('ปิด')) {
       await sendCommand('LED', 'OFF');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">IoT Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Device Status</h2>
          <p>Status: {deviceStatus?.online_status || 'Unknown'}</p>
          <p>LED: {deviceStatus?.led_status || 'Unknown'}</p>
          <p>Servo: {deviceStatus?.servo_position || 0}&deg;</p>
          <p className="text-xs text-gray-500 mt-2">Last Update: {deviceStatus?.updated_at || 'Never'}</p>
        </div>

        <div className="p-6 border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sensor Data</h2>
          <ul>
            {sensorData.map(s => (
              <li key={s.id}>{s.sensor_type}: {s.value} {s.unit} ({new Date(s.timestamp).toLocaleTimeString()})</li>
            ))}
            {sensorData.length === 0 && <li>No recent data</li>}
          </ul>
        </div>

        <div className="p-6 border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex gap-4 mb-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => sendCommand('LED', 'ON')}>LED ON</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => sendCommand('LED', 'OFF')}>LED OFF</button>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => sendCommand('SERVO', 'SET_POSITION', 0)}>Servo 0&deg;</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => sendCommand('SERVO', 'SET_POSITION', 90)}>Servo 90&deg;</button>
          </div>
        </div>

        <div className="p-6 border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">LLM Control</h2>
          <input 
            type="text" 
            className="border p-2 rounded w-full mb-4 text-black" 
            placeholder="e.g. เปิดไฟ, ตั้ง Servo เป็น 90 องศา" 
            value={llmCommand}
            onChange={(e) => setLlmCommand(e.target.value)}
          />
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" onClick={handleLlmSubmit}>Send to LLM</button>
        </div>
      </div>
    </div>
  );
}
