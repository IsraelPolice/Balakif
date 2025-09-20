import React from 'react'
import { motion } from 'framer-motion'
import { Star, Plus, Minus } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { hapticFeedback } from '../utils/device'

function PlayerCard({ player, onSelect, onRemove, isInSquad = false, showActions = true, size = 'normal' }) {
  const { getRarityColor, getStars } = useGame()

  const handleAction = () => {
    hapticFeedback('light')
    if (isInSquad && onRemove) {
      onRemove()
    } else if (onSelect) {
      onSelect(player)
    }
  }

  const cardSizes = {
    small: 'w-32 h-44',
    normal: 'w-40 h-56',
    large: 'w-48 h-64'
  }

  const textSizes = {
    small: { name: 'text-sm', rating: 'text-2xl', position: 'text-xs' },
    normal: { name: 'text-base', rating: 'text-3xl', position: 'text-sm' },
    large: { name: 'text-lg', rating: 'text-4xl', position: 'text-base' }
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${cardSizes[size]} relative cursor-pointer group`}
    >
      {/* Card Background */}
      <div className={`w-full h-full bg-gradient-to-br ${getRarityColor(player.rarity)} rounded-xl shadow-lg relative overflow-hidden`}>
        {/* Rarity Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(player.rarity)} opacity-20 animate-glow rounded-xl`} />
        
        {/* Card Content */}
        <div className="relative z-10 p-3 h-full flex flex-col">
          {/* Rating */}
          <div className="text-center mb-2">
            <div className="bg-black/30 rounded-lg px-2 py-1 inline-block">
              <span className={`font-black ${textSizes[size].rating} text-white text-shadow`}>
                {player.rating}
              </span>
            </div>
          </div>

          {/* Player Avatar */}
          <div className="flex-1 flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🇮🇱</span>
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center space-y-1">
            <h3 className={`font-bold text-white text-shadow ${textSizes[size].name} leading-tight`}>
              {player.name}
            </h3>
            <p className={`text-white/80 ${textSizes[size].position}`}>
              {player.position}
            </p>
            
            {/* Stars */}
            <div className="flex justify-center space-x-1 space-x-reverse">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < getStars(player.rating)
                      ? 'text-legendary fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Value */}
            <p className="text-xs text-white/60" dir="ltr">
              €{(player.value / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Action Button */}
        {showActions && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAction}
            className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center ${
              isInSquad
                ? 'bg-danger hover:bg-red-600'
                : 'bg-neon hover:bg-green-400'
            } text-white shadow-lg transition-colors duration-200`}
          >
            {isInSquad ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </motion.button>
        )}

        {/* Rarity Indicator */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(player.rarity)}`} />
      </div>
    </motion.div>
  )
}

export default PlayerCard