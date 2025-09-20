import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Shuffle, Trash2, Share2, Filter } from 'lucide-react'
import { useGame } from '../context/GameContext'
import PlayerCard from './PlayerCard'
import BottomNavigation from './BottomNavigation'
import { hapticFeedback } from '../utils/device'

function SquadBuilder({ onNavigate }) {
  const {
    squad,
    playersData,
    coins,
    addToSquad,
    removeFromSquad,
    clearSquad,
    getSquadRating,
    getSquadValue
  } = useGame()

  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filters = [
    { id: 'all', label: 'הכל', count: playersData.length },
    { id: 'legendary', label: 'אגדיים', count: playersData.filter(p => p.rarity === 'legendary').length },
    { id: 'epic', label: 'אפיים', count: playersData.filter(p => p.rarity === 'epic').length },
    { id: 'rare', label: 'נדירים', count: playersData.filter(p => p.rarity === 'rare').length },
    { id: 'common', label: 'רגילים', count: playersData.filter(p => p.rarity === 'common').length }
  ]

  const filteredPlayers = selectedFilter === 'all' 
    ? playersData 
    : playersData.filter(p => p.rarity === selectedFilter)

  const availablePlayers = filteredPlayers.filter(
    player => !squad.find(squadPlayer => squadPlayer.id === player.id)
  )

  const handleAddPlayer = (player) => {
    const success = addToSquad(player)
    if (success) {
      hapticFeedback('success')
    } else {
      hapticFeedback('error')
    }
  }

  const handleRemovePlayer = (index) => {
    removeFromSquad(index)
    hapticFeedback('medium')
  }

  const handleRandomSquad = () => {
    clearSquad()
    const shuffled = [...playersData].sort(() => Math.random() - 0.5)
    for (let i = 0; i < 5 && i < shuffled.length; i++) {
      addToSquad(shuffled[i])
    }
    hapticFeedback('success')
  }

  const handleClearSquad = () => {
    clearSquad()
    hapticFeedback('medium')
  }

  const isOverBudget = getSquadValue() > coins

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('menu')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-bold text-shadow">הרכב הקבוצה</h1>
          <div className="w-10" />
        </div>

        {/* Squad Stats */}
        <div className="glass-effect rounded-xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-300">שחקנים</p>
              <p className="text-xl font-bold text-neon">{squad.length}/5</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">דירוג</p>
              <p className="text-xl font-bold text-legendary">{getSquadRating()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">שווי</p>
              <p className={`text-xl font-bold ${isOverBudget ? 'text-danger' : 'text-white'}`} dir="ltr">
                €{(getSquadValue() / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          {isOverBudget && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-danger text-sm text-center mt-2"
            >
              חריגה מהתקציב! הסירו שחקנים יקרים
            </motion.p>
          )}
        </div>

        {/* Squad Actions */}
        <div className="flex space-x-2 space-x-reverse mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRandomSquad}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Shuffle className="w-5 h-5" />
            <span>הרכב אקראי</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClearSquad}
            disabled={squad.length === 0}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <span>נקה הכל</span>
          </motion.button>
        </div>
      </div>

      {/* Squad Formation */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-4">ההרכב שלכם</h2>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              layout
              className="aspect-[3/4] border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center relative"
            >
              {squad[index] ? (
                <PlayerCard
                  player={squad[index]}
                  onRemove={() => handleRemovePlayer(index)}
                  isInSquad={true}
                  size="small"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">שחקן {index + 1}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">שחקנים זמינים</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
                {filters.map((filter) => (
                  <motion.button
                    key={filter.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-neon text-primary'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Available Players */}
      <div className="px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {availablePlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onSelect={handleAddPlayer}
                showActions={squad.length < 5}
                size="small"
              />
            ))}
          </AnimatePresence>
        </div>

        {availablePlayers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">אין שחקנים זמינים בקטגוריה זו</p>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentScreen="squad" onNavigate={onNavigate} />
    </motion.div>
  )
}

export default SquadBuilder