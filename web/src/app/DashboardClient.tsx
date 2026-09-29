'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/ChatUI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { 
  Sun, Battery, Zap, Activity, Thermometer, Clock, 
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
  
  // Alarm Clock States
  const [alarmTime, setAlarmTime] = useState<string>('');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(false);
  
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // Load alarm settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('sleep_alarm_time');
      const savedEnabled = localStorage.getItem('sleep_alarm_enabled') === 'true';
      if (savedTime) setAlarmTime(savedTime);
      setIsAlarmEnabled(savedEnabled);
    }
  }, []);

  // Alarm ticker
  useEffect(() => {
    if (!isAlarmEnabled || !alarmTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentSeconds = now.getSeconds().toString().padStart(2, '0');
      
      const [alarmH, alarmM] = alarmTime.split(':');
      
      if (currentHours === alarmH && currentMinutes === alarmM && currentSeconds === '00') {
        if (deviceStatus?.buzzer_status !== 'ON') {
          toggleBuzzer('ON');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmTime, isAlarmEnabled, deviceStatus]);

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
    }
    
    setIsRgbPending(false);
  };

  // Derive sleep data from latest sensor data
  const latestData = sensorData?.[0] || null;
  const temp = latestData ? latestData.temperature : null;
  const light = latestData ? latestData.light : null;
  
  let sleepScore = 0;
  let scoreStatus = "🤔 กำลังประมวลผล...";
  let feelingStyle = "from-gray-500 to-gray-700 shadow-gray-500/20";
  let feelingIcon = <Activity className="w-8 h-8 text-white opacity-80" />;
  let tempFeedback = "";
  let lightFeedback = "";
  
  if (latestData) {
    // Medical Standard Evaluation for Sleep
    // 1. Temperature: National Sleep Foundation recommends 15.6 - 19.4°C, but for tropical climates 20-24°C is widely accepted as optimal.
    let tempScore = 100;
    if (temp >= 20 && temp <= 24) {
      tempScore = 100;
      tempFeedback = "อุณหภูมิอยู่ในเกณฑ์ดีเยี่ยมตามมาตรฐานการแพทย์";
    } else if (temp >= 25 && temp <= 27) {
      tempScore = 70;
      tempFeedback = "อุณหภูมิค่อนข้างอุ่น อาจทำให้หลับไม่สนิท";
    } else if (temp < 20) {
      tempScore = 60;
      tempFeedback = "อุณหภูมิเย็นเกินไป อาจทำให้ตื่นกลางดึก";
    } else {
      tempScore = 30;
      tempFeedback = "อุณหภูมิร้อนเกินไป ไม่เหมาะกับการนอนหลับ";
    }
    
    // 2. Light: Lux standard (<5 lux is ideal for Melatonin production)
    let lightScore = 100;
    if (light <= 5) {
      lightScore = 100;
      lightFeedback = "สภาพแสงมืดสนิท เหมาะสมต่อการหลั่งฮอร์โมนเมลาโทนิน";
    } else if (light <= 30) {
      lightScore = 70;
      lightFeedback = "มีแสงสลัวรบกวนเล็กน้อย ควรปิดม่านหรือหรี่ไฟลงอีก";
    } else {
      lightScore = 30;
      lightFeedback = "สภาพแสงสว่างเกินไป สมองจะไม่เข้าสู่ภาวะหลับลึก";
    }
    
    let buzzerScore = 100;
    if (deviceStatus?.buzzer_status === 'ON') buzzerScore = 0;
    
    sleepScore = Math.round((tempScore * 0.5) + (lightScore * 0.5));
    if (buzzerScore === 0) sleepScore = 0; // Alarm forces score to 0
    
    if (sleepScore >= 85) {
      scoreStatus = "😊 ดีเยี่ยม (ตามมาตรฐานการแพทย์)";
      feelingStyle = "from-emerald-400 to-teal-600 shadow-emerald-500/30";
      feelingIcon = <Zap className="w-8 h-8 text-white opacity-80" />;
    } else if (sleepScore >= 60) {
      scoreStatus = "😐 ปานกลาง (อาจรบกวนการนอน)";
      feelingStyle = "from-amber-400 to-orange-500 shadow-orange-500/30";
      feelingIcon = <Activity className="w-8 h-8 text-white opacity-80" />;
    } else {
      scoreStatus = "😫 แย่ (ไม่เหมาะกับการนอนหลับ)";
      feelingStyle = "from-rose-500 to-red-600 shadow-red-500/30";
      feelingIcon = <ShieldAlert className="w-8 h-8 text-white opacity-80" />;
    }
  }

  // Prepare Chart Data (Temperature & Light)
  const chartData = sensorData
    ?.slice(0, 20)
    .reverse()
    .map(d => ({
      time: format(new Date(d.created_at), 'HH:mm:ss'),
      temperature: d.temperature,
      light: d.light
    })) || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Main Content Column */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Connection Status Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">System Status</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {isConnected ? 'Online' : 'Offline'}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isConnected ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' : 'bg-gradient-to-br from-red-400 to-red-500 text-white'}`}>
              {isConnected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Temperature</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {temp !== null ? `${temp.toFixed(1)}°C` : '--°C'}
              </h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-400 text-white shadow-inner shadow-white/20 rounded-2xl flex items-center justify-center">
              <Thermometer className="w-6 h-6" />
            </div>
          </div>

          {/* Light Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Light Intensity</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {light !== null ? `${light.toFixed(1)} Lux` : '-- Lux'}
              </h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-inner shadow-white/20 rounded-2xl flex items-center justify-center">
              <Sun className="w-6 h-6" />
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
                <p className="text-white/80 font-bold text-xs mb-2 uppercase tracking-widest">Sleep Environment Score (Medical Std.)</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight">{sleepScore} / 100</h2>
                <h3 className="text-xl font-bold mt-2 mb-4">{scoreStatus}</h3>
                
                <div className="flex flex-col gap-2 mt-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-start gap-2">
                    <Thermometer className="w-5 h-5 opacity-80 shrink-0" />
                    <p className="text-sm font-medium text-white/90">{tempFeedback || "กำลังรอข้อมูลอุณหภูมิ..."}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sun className="w-5 h-5 opacity-80 shrink-0" />
                    <p className="text-sm font-medium text-white/90">{lightFeedback || "กำลังรอข้อมูลแสง..."}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner hidden sm:block">
                {feelingIcon}
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/90 bg-black/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm">
                <Clock className="w-4 h-4 opacity-70" />
                <span>Sync: {latestData?.created_at ? format(new Date(latestData.created_at), 'HH:mm:ss') : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Controls Bento Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <h2 className="text-sm font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Hardware Controls
            </h2>
            
            <div className="flex flex-col gap-4 flex-1 justify-center">
              {/* Buzzer Control */}
              <div className="flex flex-col p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-sm ${deviceStatus?.buzzer_status === 'ON' ? 'bg-gradient-to-br from-red-400 to-red-500 text-white' : 'bg-white text-gray-400'}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Alarm Buzzer</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{isBuzzerPending ? 'Syncing...' : 'Manual Toggle'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button 
                      disabled={isBuzzerPending || deviceStatus?.buzzer_status === 'ON'}
                      onClick={() => toggleBuzzer('ON')}
                      className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${deviceStatus?.buzzer_status === 'ON' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-red-500' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                    >
                      ON
                    </button>
                    <button 
                      disabled={isBuzzerPending || deviceStatus?.buzzer_status === 'OFF'}
                      onClick={() => toggleBuzzer('OFF')}
                      className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${deviceStatus?.buzzer_status === 'OFF' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-gray-800' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                    >
                      OFF
                    </button>
                  </div>
                </div>
                
                {/* Alarm Clock Settings */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Set Alarm</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={alarmTime}
                      onChange={(e) => {
                        setAlarmTime(e.target.value);
                        localStorage.setItem('sleep_alarm_time', e.target.value);
                      }}
                      className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-400 text-gray-700"
                    />
                    <button
                      onClick={() => {
                        const newState = !isAlarmEnabled;
                        setIsAlarmEnabled(newState);
                        localStorage.setItem('sleep_alarm_enabled', newState.toString());
                      }}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${isAlarmEnabled ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                    >
                      {isAlarmEnabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RGB LED Control */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl shadow-sm ${deviceStatus?.rgb_status === 'ON' ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white' : 'bg-white text-gray-400'}`}>
                    <Lightbulb 
                      className="w-5 h-5"
                      style={deviceStatus?.rgb_status === 'ON' ? { color: '#ffffff', filter: `drop-shadow(0 0 4px ${deviceStatus?.rgb_color})` } : {}}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">RGB Status</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{isRgbPending ? 'Syncing...' : 'GPIO 26, 27'}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl items-center">
                  {deviceStatus?.rgb_status === 'ON' && (
                    <input 
                      type="color" 
                      value={deviceStatus?.rgb_color || '#000000'} 
                      onChange={(e) => changeRgbColor('ON', e.target.value)}
                      disabled={isRgbPending}
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent ml-2"
                    />
                  )}
                  <button 
                    disabled={isRgbPending || deviceStatus?.rgb_status === 'ON'}
                    onClick={() => changeRgbColor('ON')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${deviceStatus?.rgb_status === 'ON' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-indigo-500' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                  >
                    ON
                  </button>
                  <button 
                    disabled={isRgbPending || deviceStatus?.rgb_status === 'OFF'}
                    onClick={() => changeRgbColor('OFF')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${deviceStatus?.rgb_status === 'OFF' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-gray-800' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                  >
                    OFF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Environmental Trends (Medical Standard)
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
                    <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#f97316', fontWeight: 600 }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#3b82f6', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'temperature') return [`${parseFloat(value).toFixed(1)} °C`, 'Temperature'];
                      if (name === 'light') return [`${parseFloat(value).toFixed(1)} Lux`, 'Illuminance'];
                      return [value, name];
                    }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    animationDuration={500}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="light" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorLight)" 
                    animationDuration={500}
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
