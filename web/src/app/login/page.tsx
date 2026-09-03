import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Admin Login</h2>
          <p className="text-gray-400 mt-2 text-sm">เข้าสู่ระบบเพื่อควบคุมกระถางต้นไม้</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email:</label>
            <input 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
              id="email" 
              name="email" 
              type="email" 
              placeholder="admin@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Password:</label>
            <input 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              formAction={login}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition"
            >
              เข้าสู่ระบบ (Log in)
            </button>
            
            <button 
              formAction={signup}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg font-medium transition"
            >
              สร้างบัญชี (Sign up)
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          * สำหรับการเข้าใช้งานครั้งแรก ให้ใส่อีเมลและรหัสผ่านที่ต้องการ แล้วกด "สร้างบัญชี" ได้เลยครับ
        </p>
      </div>
    </div>
  )
}
