'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/ChatUI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { 
  Droplet, Battery, Zap, Activity, Thermometer, Clock, 
  Wifi, WifiOff, Power, ShieldAlert, Cpu, Bell, Lightbulb
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
  const [isBuzzerPending, setIsBuzzerPending] = useState(false);
  const [isRgbPending, setIsRgbPending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const channel = supabase
      .channel('iot_dashboard_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_status', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        console.log('Realtime device_status UPDATE:', payload);
        setDeviceStatus((prev: any) => ({ ...prev, ...payload.new }));
        setIsBuzzerPending(false);
        setIsRgbPending(false);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sleep_monitor_data', filter: 'device_id=eq.esp32-device-01' }, (payload) => {
        setSensorData(prev => [payload.new, ...prev].slice(0, 100)); // Keep latest 100
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleBuzzer = async (newStatus: 'ON' | 'OFF') => {
    setIsBuzzerPending(true);
    const { error } = await supabase
      .from('device_status')
      .upsert({
        device_id: 'esp32-device-01',
        buzzer_status: newStatus
      }, { onConflict: 'device_id' });
      
    if (error) {
      alert(`Error sending Buzzer command: ` + error.message);
      setIsBuzzerPending(false);
    }
  };

  const changeRgbColor = async (newStatus: 'ON' | 'OFF', newColor?: string) => {
    setIsRgbPending(true);
    const updateData: any = {
      device_id: 'esp32-device-01',
      rgb_status: newStatus
    };
    if (newColor) updateData.rgb_color = newColor;

    const { error } = await supabase
      .from('device_status')
      .upsert(updateData, { onConflict: 'device_id' });
      
    if (error) {
      alert(`Error sending RGB command: ` + error.message);
      setIsRgbPending(false);
    }
  };

  // Derive sleep data from latest sensor data
  const latestData = sensorData?.[0] || null;
  const temp = latestData ? latestData.temperature : null;
  const light = latestData ? latestData.light : null;
  
  let sleepScore = 0;
  let scoreStatus = "🤔 กำลังประมวลผล...";
  let feelingStyle = "from-gray-500 to-gray-700 shadow-gray-500/20";
  let feelingIcon = <Activity className="w-8 h-8 text-white opacity-80" />;
  
  if (latestData) {
    // Prototype sleep score calculation without accelerometer
    let tempScore = 100;
    if (temp < 20 || temp > 28) tempScore -= 30; // Ideal temp around 24
    else if (temp < 22 || temp > 26) tempScore -= 10;
    
    let lightScore = 100;
    if (light > 50) lightScore -= 50; // Too bright
    else if (light > 20) lightScore -= 20;
    
    let buzzerScore = 100;
    if (deviceStatus?.buzzer_status === 'ON') buzzerScore -= 50; // Buzzer is annoying
    
    sleepScore = Math.round((tempScore + lightScore + buzzerScore) / 3);
    
    if (sleepScore >= 80) {
      scoreStatus = "😊 สภาพแวดล้อมดีเยี่ยม (Good)";
      feelingStyle = "from-indigo-400 to-purple-600 shadow-indigo-500/30";
      feelingIcon = <Zap className="w-8 h-8 text-white opacity-80" />;
    } else if (sleepScore >= 60) {
      scoreStatus = "😐 สภาพแวดล้อมปานกลาง (Moderate)";
      feelingStyle = "from-orange-400 to-yellow-600 shadow-orange-500/30";
      feelingIcon = <Activity className="w-8 h-8 text-white opacity-80" />;
    } else {
      scoreStatus = "😫 ควรปรับสภาพแวดล้อม (Poor)";
      feelingStyle = "from-red-500 to-rose-600 shadow-red-500/30";
      feelingIcon = <ShieldAlert className="w-8 h-8 text-white opacity-80" />;
    }
    
    // Alerts
    if (temp > 28) console.warn("อุณหภูมิห้องสูงกว่าค่าที่กำหนด");
    if (light > 50) console.warn("มีแสงรบกวนในช่วงเวลานอน");
  }

  // Prepare Chart Data (Temperature)
  const chartData = sensorData
    ?.slice(0, 20)
    .reverse()
    .map(d => ({
      time: format(new Date(d.created_at), 'HH:mm:ss'),
      temperature: d.temperature
    })) || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Main Content Column */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Connection Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <h3 className="text-2xl font-black text-gray-800">
                {isConnected ? 'Online' : 'Offline'}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
              {isConnected ? <Wifi className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Temperature</p>
              <h3 className="text-2xl font-black text-gray-800">
                {temp !== null ? `${temp.toFixed(1)}°C` : '--°C'}
              </h3>
            </div>
            <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center">
              <Thermometer className="w-7 h-7" />
            </div>
          </div>

          {/* Light Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Light</p>
              <h3 className="text-2xl font-black text-gray-800">
                {light !== null ? `${light.toFixed(1)}%` : '--%'}
              </h3>
            </div>
            <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center">
              <Droplet className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Score Gradient Card */}
          <div className={`relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br ${feelingStyle} shadow-xl text-white flex flex-col justify-between min-h-[260px]`}>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-black opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-white/80 font-bold text-xs mb-2 uppercase tracking-widest">Sleep Environment Score</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight">{sleepScore} / 100</h2>
                <h3 className="text-xl font-bold mt-2">{scoreStatus}</h3>
              </div>
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner hidden sm:block">
                {feelingIcon}
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/90 bg-black/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm">
                <Clock className="w-4 h-4 opacity-70" />
                <span>Sync: {deviceStatus?.updated_at ? format(new Date(deviceStatus.updated_at), 'HH:mm:ss') : 'N/A'}</span>
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
                
                {/* Buzzer Control */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${deviceStatus?.buzzer_status === 'ON' ? 'bg-red-100' : 'bg-gray-200'}`}>
                      <Bell className={`w-6 h-6 ${deviceStatus?.buzzer_status === 'ON' ? 'text-red-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Alarm Buzzer</p>
                      <p className="text-xs font-medium text-gray-500">{isBuzzerPending ? 'Syncing...' : 'GPIO 25'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl">
                    <button 
                      disabled={isBuzzerPending || deviceStatus?.buzzer_status === 'ON'}
                      onClick={() => toggleBuzzer('ON')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.buzzer_status === 'ON' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      ON
                    </button>
                    <button 
                      disabled={isBuzzerPending || deviceStatus?.buzzer_status === 'OFF'}
                      onClick={() => toggleBuzzer('OFF')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.buzzer_status === 'OFF' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      OFF
                    </button>
                  </div>
                </div>

                {/* RGB LED Control */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${deviceStatus?.rgb_status === 'ON' ? 'bg-indigo-100' : 'bg-gray-200'}`}>
                      <Lightbulb 
                        className={`w-6 h-6 ${deviceStatus?.rgb_status === 'ON' ? 'text-indigo-600' : 'text-gray-500'}`} 
                        style={deviceStatus?.rgb_status === 'ON' ? { color: deviceStatus?.rgb_color } : {}}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">RGB Status</p>
                      <p className="text-xs font-medium text-gray-500">{isRgbPending ? 'Syncing...' : 'GPIO 26, 27'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl items-center">
                    {deviceStatus?.rgb_status === 'ON' && (
                      <input 
                        type="color" 
                        value={deviceStatus?.rgb_color || '#000000'} 
                        onChange={(e) => changeRgbColor('ON', e.target.value)}
                        disabled={isRgbPending}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    )}
                    <button 
                      disabled={isRgbPending || deviceStatus?.rgb_status === 'ON'}
                      onClick={() => changeRgbColor('ON')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.rgb_status === 'ON' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                    >
                      ON
                    </button>
                    <button 
                      disabled={isRgbPending || deviceStatus?.rgb_status === 'OFF'}
                      onClick={() => changeRgbColor('OFF')}
                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${deviceStatus?.rgb_status === 'OFF' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
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
              Temperature Trend
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
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
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
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#f97316' }}
                    formatter={(value: any) => [`${parseFloat(value).toFixed(1)} °C`, 'Temperature']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
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
        <ChatUI sensorData={{ ...latestData, buzzer_status: deviceStatus?.buzzer_status, rgb_status: deviceStatus?.rgb_status, rgb_color: deviceStatus?.rgb_color }} />
      </div>

    </div>
  );
}
