import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Package, Target, Star, TrendingUp, Users } from 'lucide-react'
import { useGame } from '../context/GameContext'
import BottomNavigation from './BottomNavigation'
import { hapticFeedback } from '../utils/device'

function Challenges({ onNavigate }) {
  const { squad, coins, earnCoins, getSquadRating, getSquadValue } = useGame()
  const [completedChallenges, setCompletedChallenges] = useState(new Set())

  const challenges = [
    {
      id: 'first_squad',
      title: 'הקבוצה הראשונה',
      description: 'בנו קבוצה של 5 שחקנים',
      reward: 10000000,
      icon: Users,
      type: 'squad',
      condition: () => squad.length >= 5
    },
    {
      id: 'high_rating',
      title: 'קבוצת איכות',
      description: 'השיגו דירוג ממוצע של 85+',
      reward: 25000000,
      icon: Trophy,
      type: 'rating',
      condition: () => getSquadRating() >= 85
    },
    {
      id: 'legendary_squad',
      title: 'הקבוצה האגדית',
      description: 'בנו קבוצה עם 3 שחקנים אגדיים',
      reward: 50000000,
      icon: Target,
      type: 'rarity',
      condition: () => squad.filter(p => p.rarity === 'legendary').length >= 3
    },
    {
      id: 'budget_master',
      title: 'מאסטר התקציב',
      description: 'בנו קבוצה בשווי מעל 150M€',
      reward: 30000000,
      icon: Coins,
      type: 'value',
      condition: () => getSquadValue() >= 150000000
    },
    {
      id: 'perfect_squad',
      title: 'הקבוצה המושלמת',
      description: 'השיגו דירוג ממוצע של 90+',
      reward: 75000000,
      icon: Trophy,
      type: 'rating',
      condition: () => getSquadRating() >= 90
    }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('hevre-completed-challenges')
    if (saved) {
      setCompletedChallenges(new Set(JSON.parse(saved)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hevre-completed-challenges', JSON.stringify([...completedChallenges]))
  }, [completedChallenges])

  const claimReward = (challenge) => {
    if (completedChallenges.has(challenge.id)) return
    if (!challenge.condition()) return

    earnCoins(challenge.reward)
    setCompletedChallenges(prev => new Set([...prev, challenge.id]))
    hapticFeedback('success')
  }

  const getChallengeStatus = (challenge) => {
    if (completedChallenges.has(challenge.id)) return 'completed'
    if (challenge.condition()) return 'ready'
    return 'locked'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-green-700'
      case 'ready': return 'from-neon to-legendary'
      case 'locked': return 'from-gray-500 to-gray-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'ready': return Trophy
      case 'locked': return Clock
      default: return Clock
    }
  }

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
          <h1 className="text-2xl font-bold text-shadow">אתגרים</h1>
          <div className="text-left" dir="ltr">
            <p className="text-sm text-gray-400">מטבעות</p>
            <p className="text-lg font-bold text-legendary">
              €{(coins / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="glass-effect rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">אתגרים הושלמו</p>
              <p className="text-2xl font-bold text-neon">
                {completedChallenges.size}/{challenges.length}
              </p>
            </div>
            <div className="text-left" dir="ltr">
              <p className="text-sm text-gray-300">פרסים זמינים</p>
              <p className="text-xl font-bold text-legendary">
                {challenges.filter(c => getChallengeStatus(c) === 'ready').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="px-4 space-y-4">
        {challenges.map((challenge, index) => {
          const status = getChallengeStatus(challenge)
          const StatusIcon = getStatusIcon(status)

          return (
            <motion.div
              key={challenge.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${getStatusColor(status)} rounded-xl p-6 relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <challenge.icon className="w-full h-full" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-white/20 rounded-full p-3">
                      <challenge.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{challenge.title}</h3>
                      <p className="text-white/80 text-sm">{challenge.description}</p>
                    </div>
                  </div>
                  <StatusIcon className="w-8 h-8" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left" dir="ltr">
                    <p className="text-sm text-white/60">פרס</p>
                    <p className="text-xl font-bold">€{(challenge.reward / 1000000).toFixed(1)}M</p>
                  </div>
                  
                  {status === 'ready' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimReward(challenge)}
                      className="bg-white/20 hover:bg-white/30 py-2 px-6 rounded-lg font-bold transition-colors"
                    >
                      קבל פרס
                    </motion.button>
                  )}
                  
                  {status === 'completed' && (
                    <div className="bg-white/20 py-2 px-6 rounded-lg font-bold">
                      הושלם ✓
                    </div>
                  )}
                  
                  {status === 'locked' && (
                    <div className="bg-white/10 py-2 px-6 rounded-lg font-bold text-white/50">
                      נעול
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <BottomNavigation currentScreen="challenges" onNavigate={onNavigate} />
    </motion.div>
  )
}

export default Challenges