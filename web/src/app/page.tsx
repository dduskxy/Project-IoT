import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export const revalidate = 0 // Disable caching for real-time dashboard

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch initial data for SSR
  const { data: deviceStatus, error: dsError } = await supabase
    .from('device_status')
    .select('*')
    .eq('device_id', 'esp32-device-01')
    .single()

  const { data: sensorData, error: ssError } = await supabase
    .from('sleep_monitor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (dsError) console.error("Device Status Error:", dsError)
  if (ssError) console.error("Sensor Data Error:", ssError)

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 sm:px-10 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(99,102,241,0.3)]">
            <span className="text-2xl">🌙</span>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Smart Sleep Monitor
            </h1>
            <p className="text-xs text-indigo-500 font-bold tracking-widest uppercase mt-0.5">IoT Wellness Dashboard</p>
          </div>
        </div>
      </header>

      {/* Main Dashboard Client UI */}
      <div className="p-6 sm:p-10 max-w-[1600px] mx-auto">
        <DashboardClient 
          initialDeviceStatus={deviceStatus || null} 
          initialSensorData={sensorData || []}
          isAdmin={isAdmin} 
        />
      </div>
    </main>
  )
}
