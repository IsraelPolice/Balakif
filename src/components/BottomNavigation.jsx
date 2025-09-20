import React from 'react'
import { motion } from 'framer-motion'
import { Home, Users, ShoppingBag, Target, User } from 'lucide-react'

function BottomNavigation({ currentScreen, onNavigate }) {
  const navItems = [
    { id: 'menu', icon: Home, label: 'בית' },
    { id: 'squad', icon: Users, label: 'הרכב' },
    { id: 'store', icon: ShoppingBag, label: 'חנות' },
    { id: 'challenges', icon: Target, label: 'אתגרים' },
    { id: 'profile', icon: User, label: 'פרופיל' }
  ]

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-lg border-t border-white/10 mobile-safe-area"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${
              currentScreen === item.id
                ? 'text-neon bg-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default BottomNavigation