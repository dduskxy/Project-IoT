import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export const revalidate = 0 // Disable caching for real-time dashboard

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch initial data for SSR
  const { data: deviceStatus } = await supabase
    .from('device_status')
    .select('*')
    .eq('device_id', 'esp32-device-01')
    .single()

  const { data: sensorData } = await supabase
    .from('sensor_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50)

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl">🪴</span>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
              Flaura Smart
            </h1>
            <p className="text-xs text-emerald-600 font-bold tracking-widest uppercase">IoT Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden sm:block px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
            Admin Panel
          </Link>
          {isAdmin ? (
            <form action={async () => {
              'use server';
              const { cookies } = await import('next/headers');
              const { createClient } = await import('@/utils/supabase/server');
              const supabase = createClient(await cookies());
              await supabase.auth.signOut();
            }}>
              <button className="px-6 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-black shadow-lg shadow-slate-900/20 rounded-xl transition-all">
                Logout
              </button>
            </form>
          ) : (
            <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-xl transition-all">
              Login
            </Link>
          )}
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
