import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Package, Target, Star, TrendingUp } from 'lucide-react'
import { useGame } from '../context/GameContext'
import BottomNavigation from './BottomNavigation'

function Profile({ onNavigate }) {
  const { 
    coins, 
    squad, 
    collection, 
    stats, 
    getSquadRating, 
    getSquadValue,
    playersData 
  } = useGame()

  const achievements = [
    {
      id: 'first_squad',
      title: 'הקבוצה הראשונה',
      description: 'בניתם את הקבוצה הראשונה שלכם',
      icon: Trophy,
      unlocked: squad.length >= 5
    },
    {
      id: 'pack_opener',
      title: 'פותח חבילות',
      description: 'פתחתם 10 חבילות',
      icon: Package,
      unlocked: stats.packsOpened >= 10
    },
    {
      id: 'high_roller',
      title: 'שחקן גדול',
      description: 'צברתם מעל 100M מטבעות',
      icon: TrendingUp,
      unlocked: coins >= 100000000
    },
    {
      id: 'perfectionist',
      title: 'פרפקציוניסט',
      description: 'השגתם דירוג ממוצע של 90+',
      icon: Star,
      unlocked: getSquadRating() >= 90
    }
  ]

  const collectionStats = {
    legendary: collection.filter(p => p.rarity === 'legendary').length,
    epic: collection.filter(p => p.rarity === 'epic').length,
    rare: collection.filter(p => p.rarity === 'rare').length,
    common: collection.filter(p => p.rarity === 'common').length,
    basic: collection.filter(p => p.rarity === 'basic').length
  }

  const totalPlayers = playersData.length
  const uniqueCollected = new Set(collection.map(p => p.id)).size
  const collectionPercentage = Math.round((uniqueCollected / totalPlayers) * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('menu')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-bold text-shadow">פרופיל</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Player Level */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-effect rounded-xl p-6 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-neon to-legendary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">מנהל קבוצה</h2>
          <p className="text-gray-300">רמה 1</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div className="bg-gradient-to-r from-neon to-legendary h-2 rounded-full w-1/3" />
          </div>
          <p className="text-sm text-gray-400 mt-2">33% עד הרמה הבאה</p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4">סטטיסטיקות</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-neon">{squad.length}/5</p>
            <p className="text-sm text-gray-300">שחקנים בהרכב</p>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-legendary">{getSquadRating()}</p>
            <p className="text-sm text-gray-300">דירוג ממוצע</p>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-epic" dir="ltr">
              €{(getSquadValue() / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-300">שווי הקבוצה</p>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.packsOpened || 0}</p>
            <p className="text-sm text-gray-300">חבילות נפתחו</p>
          </div>
        </div>
      </div>

      {/* Collection */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4">האוסף</h2>
        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold">{uniqueCollected}/{totalPlayers}</p>
              <p className="text-sm text-gray-300">שחקנים נאספו</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-neon">{collectionPercentage}%</p>
              <p className="text-sm text-gray-300">השלמה</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-neon to-legendary h-2 rounded-full transition-all duration-500"
              style={{ width: `${collectionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-legendary">{collectionStats.legendary}</p>
              <p className="text-gray-400">אגדי</p>
            </div>
            <div>
              <p className="font-bold text-epic">{collectionStats.epic}</p>
              <p className="text-gray-400">אפי</p>
            </div>
            <div>
              <p className="font-bold text-rare">{collectionStats.rare}</p>
              <p className="text-gray-400">נדיר</p>
            </div>
            <div>
              <p className="font-bold text-common">{collectionStats.common}</p>
              <p className="text-gray-400">רגיל</p>
            </div>
            <div>
              <p className="font-bold text-basic">{collectionStats.basic}</p>
              <p className="text-gray-400">בסיסי</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">הישגים</h2>
        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const isUnlocked = achievement.unlocked

            return (
              <motion.div
                key={achievement.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-4 flex items-center space-x-4 space-x-reverse ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-neon/20 to-legendary/20 border border-neon/30' 
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  isUnlocked ? 'bg-neon/20' : 'bg-gray-700'
                }`}>
                  <achievement.icon className={`w-6 h-6 ${
                    isUnlocked ? 'text-neon' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
                {isUnlocked && (
                  <CheckCircle className="w-6 h-6 text-neon" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} />
    </motion.div>
  )
}

export default Profile