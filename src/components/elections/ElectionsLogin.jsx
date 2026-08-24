import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Vote, Lock, Mail, ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function ElectionsLogin({ onBack, onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ADMIN_EMAIL = 'admin@hevre-hatovim.com'

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('נא למלא את כל השדות')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) throw signInError

      const isAdmin = data.user?.email?.toLowerCase() === ADMIN_EMAIL
      onLoggedIn(isAdmin)
    } catch (err) {
      setError('שם משתמש או סיסמה שגויים')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 right-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>חזרה</span>
      </motion.button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Vote className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
            בחירות 2026
          </h1>
          <p className="text-gray-400 text-lg">החבר'ה הטובים</p>
        </div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="glass-effect rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm text-gray-300 mb-2">שם משתמש (מייל)</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@Hevre-Hatovim.com"
                dir="ltr"
                className="w-full pr-11 pl-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700 focus:border-blue-500 focus:outline-none text-right text-white"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">סיסמה</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pr-11 pl-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700 focus:border-blue-500 focus:outline-none text-right text-white"
                autoComplete="current-password"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-center text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                מתחבר...
              </>
            ) : (
              'כניסה להצבעה'
            )}
          </motion.button>
        </motion.form>

        <p className="text-center text-gray-500 text-sm mt-6">
          הכניסה מותרת רק למשתמשים רשומים
        </p>
      </motion.div>
    </div>
  )
}
