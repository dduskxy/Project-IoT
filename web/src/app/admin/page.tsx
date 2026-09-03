'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminTableEditor() {
  const [commands, setCommands] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Commands
    const { data: cmdData, error: cmdError } = await supabase
      .from('commands')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!cmdError && cmdData) setCommands(cmdData);

    // Fetch Device Status
    const { data: statusData, error: statusError } = await supabase
      .from('device_status')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (!statusError && statusData) setDeviceStatus(statusData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for professional auto-updating
    const channel = supabase.channel('admin_editor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commands' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_status' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handle inserting a new command directly from the admin panel
  const handleInsertCommand = async (device: string, command: string) => {
    await supabase.from('commands').insert([
      {
        device_id: 'esp32-device-01',
        device: device,
        command: command,
        status: 'PENDING'
      }
    ]);
  };

  // Format timestamp to Thai Time (GMT+7)
  const formatThaiTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  };

  if (loading && commands.length === 0) {
    return <div className="p-8 text-center text-white">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              System Admin (Table Editor)
            </h1>
            <p className="text-gray-400 mt-2">Professional Real-time Database Management (Thai Timezone GMT+7)</p>
          </div>
          <div className="flex gap-4">
            <a 
              href="/"
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition font-bold"
            >
              ← กลับหน้าหลัก (Dashboard)
            </a>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              รีเฟรชข้อมูล
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded-lg transition"
            >
              ออกจากระบบ (Logout)
            </button>
          </div>
        </header>

        {/* Action Panel */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">ส่งคำสั่งด่วน (Quick Commands)</h2>
          <div className="flex gap-4">
            <button onClick={() => handleInsertCommand('LED', 'ON')} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition">เปิดไฟ (LED ON)</button>
            <button onClick={() => handleInsertCommand('LED', 'OFF')} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition">ปิดไฟ (LED OFF)</button>
            <button onClick={() => handleInsertCommand('PUMP', 'ON')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">เปิดปั๊ม (PUMP ON)</button>
            <button onClick={() => handleInsertCommand('PUMP', 'OFF')} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition">ปิดปั๊ม (PUMP OFF)</button>
          </div>
          <p className="text-sm text-gray-500 mt-3">* การกดปุ่มนี้จะทำการ Insert แถวใหม่ลงในตาราง `commands` ด้วยสถานะ PENDING ทันทีเหมือนทำผ่าน Supabase</p>
        </section>

        {/* Device Status Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">Device Status (อุปกรณ์)</h2>
          <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800">
                  <th className="p-4 font-medium text-gray-400">Device ID</th>
                  <th className="p-4 font-medium text-gray-400">LED</th>
                  <th className="p-4 font-medium text-gray-400">Pump</th>
                  <th className="p-4 font-medium text-gray-400">Battery</th>
                  <th className="p-4 font-medium text-gray-400">Water Level</th>
                  <th className="p-4 font-medium text-gray-400">Last Update (Thai Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {deviceStatus.map(status => (
                  <tr key={status.id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4 font-mono text-sm">{status.device_id}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${status.led_status === 'ON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>{status.led_status}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${status.pump_status === 'ON' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300'}`}>{status.pump_status}</span></td>
                    <td className="p-4">{status.battery_level}%</td>
                    <td className="p-4">{status.water_level}%</td>
                    <td className="p-4 text-sm text-gray-300">{formatThaiTime(status.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Commands Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-400">Commands Queue (ประวัติคำสั่ง 20 รายการล่าสุด)</h2>
          <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800">
                  <th className="p-4 font-medium text-gray-400">Device</th>
                  <th className="p-4 font-medium text-gray-400">Command</th>
                  <th className="p-4 font-medium text-gray-400">Status</th>
                  <th className="p-4 font-medium text-gray-400">Created At (Thai Time)</th>
                  <th className="p-4 font-medium text-gray-400">Executed At (Thai Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {commands.map(cmd => (
                  <tr key={cmd.id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4 font-semibold">{cmd.device}</td>
                    <td className="p-4 font-mono text-sm">{cmd.command}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        cmd.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        cmd.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                        cmd.status === 'EXECUTED' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {cmd.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{formatThaiTime(cmd.created_at)}</td>
                    <td className="p-4 text-sm text-gray-400">{formatThaiTime(cmd.executed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
