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
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-700">
            Smart Plant Pot
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">กระถางต้นไม้อัจฉริยะ 🪴</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
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
              <button className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 rounded-full transition-colors">
                Logout
              </button>
            </form>
          ) : (
            <Link href="/login" className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 rounded-full transition-colors">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Dashboard Client UI */}
      <div className="p-8 max-w-7xl mx-auto">
        <DashboardClient 
          initialDeviceStatus={deviceStatus || null} 
          initialSensorData={sensorData || []}
          isAdmin={isAdmin} 
        />
      </div>
    </main>
  )
}
