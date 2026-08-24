import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ElectionsLogin from './ElectionsLogin'
import ElectionsVote from './ElectionsVote'
import ElectionsAdmin from './ElectionsAdmin'

export default function Elections({ onBack }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s)
        setIsAdmin(s.user?.email?.toLowerCase() === 'admin@hevre-hatovim.com')
      }
      setCheckingSession(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      ;(async () => {
        setSession(s)
        setIsAdmin(s?.user?.email?.toLowerCase() === 'admin@hevre-hatovim.com')
      })()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setIsAdmin(false)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <ElectionsLogin
        onBack={onBack}
        onLoggedIn={(admin) => {
          setIsAdmin(admin)
        }}
      />
    )
  }

  if (isAdmin) {
    return <ElectionsAdmin user={session.user} onBack={handleLogout} />
  }

  return <ElectionsVote user={session.user} onBack={handleLogout} />
}
