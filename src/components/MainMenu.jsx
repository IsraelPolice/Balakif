import React from 'react'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Target, User, Trophy } from 'lucide-react'
import { useGame } from '../context/GameContext'
import BottomNavigation from './BottomNavigation'

function MainMenu({ onNavigate }) {
  const { coins, squad, getSquadRating, getSquadValue } = useGame()

  const menuItems = [
    {
      id: 'squad',
      title: 'הרכב הקבוצה',
      description: 'בנו את קבוצת החלומות שלכם',
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      stats: `${squad.length}/5 שחקנים`
    },
    {
      id: 'store',
      title: 'חנות',
      description: 'קנו חבילות שחקנים חדשות',
      icon: ShoppingBag,
      color: 'from-green-500 to-green-700',
      stats: 'חבילות זמינות'
    },
    {
      id: 'challenges',
      title: 'אתגרים',
      description: 'השלימו משימות והרוויחו מטבעות',
      icon: Target,
      color: 'from-purple-500 to-purple-700',
      stats: 'פרסים יומיים'
    },
    {
      id: 'profile',
      title: 'פרופיל',
      description: 'סטטיסטיקות והישגים',
      icon: User,
      color: 'from-orange-500 to-orange-700',
      stats: 'רמה 1'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 pt-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-shadow">החבר'ה הטובים</h1>
            <p className="text-neon font-semibold">ULTIMATE TEAM</p>
          </div>
          <div className="text-left" dir="ltr">
            <p className="text-sm text-gray-400">מטבעות</p>
            <p className="text-xl font-bold text-legendary">
              €{(coins / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Squad Summary */}
        {squad.length > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">הקבוצה שלכם</p>
                <p className="text-lg font-bold">{squad.length}/5 שחקנים</p>
              </div>
              <div className="text-left" dir="ltr">
                <p className="text-sm text-gray-300">דירוג ממוצע</p>
                <p className="text-2xl font-bold text-neon">{getSquadRating()}</p>
              </div>
              <div className="text-left" dir="ltr">
                <p className="text-sm text-gray-300">שווי</p>
                <p className="text-lg font-bold text-legendary">
                  €{(getSquadValue() / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Menu Items */}
      <div className="px-4 space-y-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id)}
            className={`bg-gradient-to-r ${item.color} rounded-xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-white/20 rounded-full p-3">
                <item.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-white/80 text-sm mb-2">{item.description}</p>
                <p className="text-xs text-white/60">{item.stats}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNavigation currentScreen="menu" onNavigate={onNavigate} />
    </motion.div>
  )
}

export default MainMenu