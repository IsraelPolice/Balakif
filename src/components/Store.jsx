import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Package, Sparkles, Zap, Gift } from 'lucide-react'
import { useGame } from '../context/GameContext'
import PlayerCard from './PlayerCard'
import BottomNavigation from './BottomNavigation'
import { hapticFeedback } from '../utils/device'

function Store({ onNavigate }) {
  const { coins, spendCoins, addToCollection, updateStats, playersData } = useGame()
  const [openingPack, setOpeningPack] = useState(false)
  const [revealedCards, setRevealedCards] = useState([])
  const [showCards, setShowCards] = useState(false)

  const packs = [
    {
      id: 'bronze',
      name: 'חבילת ברונזה',
      description: '3 שחקנים רגילים',
      price: 5000000,
      icon: Package,
      color: 'from-orange-500 to-orange-700',
      cards: 3,
      guarantees: ['common', 'common', 'common']
    },
    {
      id: 'silver',
      name: 'חבילת כסף',
      description: '3 שחקנים + 1 נדיר מובטח',
      price: 15000000,
      icon: Sparkles,
      color: 'from-gray-400 to-gray-600',
      cards: 4,
      guarantees: ['common', 'common', 'rare', 'rare']
    },
    {
      id: 'gold',
      name: 'חבילת זהב',
      description: '5 שחקנים + 1 אפי מובטח',
      price: 35000000,
      icon: Zap,
      color: 'from-yellow-400 to-yellow-600',
      cards: 5,
      guarantees: ['rare', 'rare', 'epic', 'epic', 'epic']
    },
    {
      id: 'ultimate',
      name: 'חבילת אלטימט',
      description: '5 שחקנים + 1 אגדי מובטח',
      price: 75000000,
      icon: Gift,
      color: 'from-purple-500 to-purple-700',
      cards: 5,
      guarantees: ['epic', 'epic', 'legendary', 'legendary', 'legendary']
    }
  ]

  const getRandomPlayerByRarity = (rarity) => {
    const rarityPlayers = playersData.filter(p => p.rarity === rarity)
    if (rarityPlayers.length === 0) return playersData[0]
    return rarityPlayers[Math.floor(Math.random() * rarityPlayers.length)]
  }

  const openPack = async (pack) => {
    if (!spendCoins(pack.price)) {
      hapticFeedback('error')
      return
    }

    setOpeningPack(true)
    hapticFeedback('medium')

    // Simulate pack opening delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newCards = pack.guarantees.map(rarity => getRandomPlayerByRarity(rarity))
    setRevealedCards(newCards)
    addToCollection(newCards)
    updateStats({ packsOpened: 1 })
    
    setOpeningPack(false)
    setShowCards(true)
    hapticFeedback('success')
  }

  const closeCardReveal = () => {
    setShowCards(false)
    setRevealedCards([])
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
          <h1 className="text-2xl font-bold text-shadow">חנות</h1>
          <div className="text-left" dir="ltr">
            <p className="text-sm text-gray-400">מטבעות</p>
            <p className="text-lg font-bold text-legendary">
              €{(coins / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      {/* Packs */}
      <div className="px-4 space-y-4">
        {packs.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${pack.color} rounded-xl p-6 relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-repeat" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="bg-white/20 rounded-full p-3">
                    <pack.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{pack.name}</h3>
                    <p className="text-white/80">{pack.description}</p>
                  </div>
                </div>
                <div className="text-left" dir="ltr">
                  <p className="text-2xl font-bold">€{(pack.price / 1000000).toFixed(1)}M</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openPack(pack)}
                disabled={coins < pack.price || openingPack}
                className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed py-3 px-6 rounded-lg font-bold transition-all duration-200"
              >
                {coins < pack.price ? 'אין מספיק מטבעות' : 'פתח חבילה'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pack Opening Animation */}
      <AnimatePresence>
        {openingPack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-br from-legendary to-epic rounded-xl flex items-center justify-center"
            >
              <Package className="w-16 h-16 text-white" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-32 text-xl font-bold text-center"
            >
              פותח חבילה...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Reveal */}
      <AnimatePresence>
        {showCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-secondary rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-neon">
                השחקנים החדשים שלכם!
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {revealedCards.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                  >
                    <PlayerCard
                      player={player}
                      showActions={false}
                      size="small"
                    />
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeCardReveal}
                className="w-full bg-gradient-to-r from-neon to-legendary text-primary font-bold py-3 px-6 rounded-lg"
              >
                המשך
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation currentScreen="store" onNavigate={onNavigate} />
    </motion.div>
  )
}

export default Store