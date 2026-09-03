'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/ChatUI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { 
  Droplet, Battery, Zap, Activity, Thermometer, Clock, 
  Wifi, WifiOff, Power, ShieldAlert, Cpu
} from 'lucide-react';

export default function DashboardClient({ 
  initialDeviceStatus, 
  initialSensorData,
  isAdmin = false 
}: { 
  initialDeviceStatus: any, 
  initialSensorData: any[],
  isAdmin?: boolean 
}) {
  const [deviceStatus, setDeviceStatus] = useState<any>(initialDeviceStatus);
  const [sensorData, setSensorData] = useState<any[]>(initialSensorData);
  const [pendingDevices, setPendingDevices] = useState<Record<string, boolean>>({});
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const channel = supabase
      .channel('iot_dashboard_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_status', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        setDeviceStatus((prev: any) => ({ ...prev, ...payload.new }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        setSensorData(prev => [payload.new, ...prev].slice(0, 100)); // Keep latest 100
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
  const latestMoistureReading = sensorData?.find((d: any) => d.sensor_type === 'SOIL_MOISTURE');
  const latestMoisture = latestMoistureReading ? latestMoistureReading.value : null;
  
  let plantFeeling = "🤔 กำลังประมวลผล...";
  let feelingStyle = "from-gray-500 to-gray-700 shadow-gray-500/20";
  let feelingIcon = <Activity className="w-8 h-8 text-white opacity-80" />;
  
  if (latestMoisture !== null) {
    if (latestMoisture < 30) {
      plantFeeling = "🥵 ดินแห้งเกินไป หิวน้ำ!";
      feelingStyle = "from-orange-500 to-red-600 shadow-red-500/30";
      feelingIcon = <Thermometer className="w-8 h-8 text-white opacity-80" />;
    } else if (latestMoisture <= 70) {
      plantFeeling = "😊 ความชื้นดีเยี่ยม สดชื่น!";
      feelingStyle = "from-emerald-400 to-teal-600 shadow-emerald-500/30";
      feelingIcon = <Droplet className="w-8 h-8 text-white opacity-80" />;
    } else {
      plantFeeling = "🥶 น้ำเยอะเกินไปแล้ว!";
      feelingStyle = "from-blue-500 to-indigo-600 shadow-blue-500/30";
      feelingIcon = <Zap className="w-8 h-8 text-white opacity-80" />;
    }
  }

  const isLedPending = pendingDevices['LED'];
  const isPumpPending = pendingDevices['PUMP'];

  // Prepare Chart Data
  const chartData = sensorData
    ?.filter(d => d.sensor_type === 'SOIL_MOISTURE')
    .slice(0, 20)
    .reverse()
    .map(d => ({
      time: format(new Date(d.timestamp), 'HH:mm:ss'),
      value: d.value
    })) || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Main Content Column */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Connection Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <h3 className="text-2xl font-black text-gray-800">
                {isConnected ? 'Online' : 'Offline'}
              </h3>
            </div>
            <div className={`p-4 rounded-2xl ${isConnected ? 'bg-green-50' : 'bg-red-50'}`}>
              {isConnected ? <Wifi className="w-7 h-7 text-green-500" /> : <WifiOff className="w-7 h-7 text-red-500" />}
            </div>
          </div>

          {/* Moisture Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Moisture</p>
              <h3 className="text-2xl font-black text-gray-800">
                {latestMoisture !== null ? `${latestMoisture.toFixed(0)}%` : '--'}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50">
              <Droplet className="w-7 h-7 text-blue-500" />
            </div>
          </div>

          {/* Water Tank Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tank Level</p>
              <h3 className="text-2xl font-black text-gray-800">
                {deviceStatus?.water_level !== undefined ? `${deviceStatus.water_level}%` : '--'}
              </h3>
            </div>
            <div className={`p-4 rounded-2xl ${deviceStatus?.water_level < 20 ? 'bg-orange-50' : 'bg-cyan-50'}`}>
              <Activity className={`w-7 h-7 ${deviceStatus?.water_level < 20 ? 'text-orange-500' : 'text-cyan-500'}`} />
            </div>
          </div>

          {/* Battery Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Battery</p>
              <h3 className="text-2xl font-black text-gray-800">
                {deviceStatus?.battery_level !== undefined ? `${deviceStatus.battery_level}%` : '--'}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50">
              <Battery className="w-7 h-7 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Hero Section (Plant Feeling + Quick Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Feeling Gradient Card */}
          <div className={`relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br ${feelingStyle} shadow-xl text-white flex flex-col justify-between min-h-[260px]`}>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-black opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-white/80 font-bold text-xs mb-2 uppercase tracking-widest">AI Status Analysis</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight">{plantFeeling}</h2>
              </div>
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner hidden sm:block">
                {feelingIcon}
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/90 bg-black/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm">
                <Clock className="w-4 h-4 opacity-70" />
                <span>Sync: {deviceStatus?.last_active ? format(new Date(deviceStatus.last_active), 'HH:mm:ss') : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Controls Bento Card */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col">
            <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Cpu className="w-5 h-5 text-indigo-500" />
              Hardware Controls
            </h2>
            
            {!isAdmin ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                <ShieldAlert className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-gray-800 font-bold text-lg mb-1">Restricted Access</h3>
                <p className="text-gray-500 text-sm mb-6 text-center max-w-[200px]">Login required to execute hardware commands.</p>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-gray-900/20"
                >
                  Admin Login
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1 justify-center">
                
                {/* LED Control */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${deviceStatus?.led_status === 'ON' ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                      <Zap className={`w-6 h-6 ${deviceStatus?.led_status === 'ON' ? 'text-yellow-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Grow Light</p>
                      <p className="text-xs font-medium text-gray-500">{isLedPending ? 'Syncing...' : 'GPIO 2'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl">
                    <button 
                      disabled={isLedPending || deviceStatus?.led_status === 'ON'}
                      onClick={() => toggleDevice('LED', 'ON')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.led_status === 'ON' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      ON
                    </button>
                    <button 
                      disabled={isLedPending || deviceStatus?.led_status === 'OFF'}
                      onClick={() => toggleDevice('LED', 'OFF')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.led_status === 'OFF' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      OFF
                    </button>
                  </div>
                </div>

                {/* Pump Control */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${deviceStatus?.pump_status === 'ON' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                      <Power className={`w-6 h-6 ${deviceStatus?.pump_status === 'ON' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Water Pump</p>
                      <p className="text-xs font-medium text-gray-500">{isPumpPending ? 'Syncing...' : 'Relay Control'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl">
                    <button 
                      disabled={isPumpPending || deviceStatus?.pump_status === 'ON'}
                      onClick={() => toggleDevice('PUMP', 'ON')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.pump_status === 'ON' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      ON
                    </button>
                    <button 
                      disabled={isPumpPending || deviceStatus?.pump_status === 'OFF'}
                      onClick={() => toggleDevice('PUMP', 'OFF')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.pump_status === 'OFF' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      OFF
                    </button>
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Moisture Trend
            </h2>
            <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
              Live Data
            </span>
          </div>
          
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#10b981' }}
                    formatter={(value: any) => [`${value}%`, 'Moisture']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorMoisture)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <Activity className="w-8 h-8 opacity-50 animate-pulse" />
                <p className="font-medium text-sm">Waiting for sensor data...</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Chat UI */}
      <div className="xl:col-span-1 h-full min-h-[600px]">
        <ChatUI />
      </div>

    </div>
  );
}
