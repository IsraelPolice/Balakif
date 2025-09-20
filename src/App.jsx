import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import WelcomeScreen from './components/WelcomeScreen'
import MainMenu from './components/MainMenu'
import SquadBuilder from './components/SquadBuilder'
import Store from './components/Store'
import Challenges from './components/Challenges'
import Profile from './components/Profile'
import { GameProvider } from './context/GameContext'
import { isMobile } from './utils/device'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has played before
    const hasPlayed = localStorage.getItem('hevre-ultimate-team-played')
    if (hasPlayed) {
      setCurrentScreen('menu')
    }
    setIsLoading(false)
  }, [])

  const handleStartGame = () => {
    localStorage.setItem('hevre-ultimate-team-played', 'true')
    setCurrentScreen('menu')
  }

  const backend = isMobile() ? TouchBackend : HTML5Backend

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <DndProvider backend={backend}>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-x-hidden">
          <AnimatePresence mode="wait">
            {currentScreen === 'welcome' && (
              <WelcomeScreen key="welcome" onStart={handleStartGame} />
            )}
            {currentScreen === 'menu' && (
              <MainMenu key="menu" onNavigate={setCurrentScreen} />
            )}
            {currentScreen === 'squad' && (
              <SquadBuilder key="squad" onNavigate={setCurrentScreen} />
            )}
            {currentScreen === 'store' && (
              <Store key="store" onNavigate={setCurrentScreen} />
            )}
            {currentScreen === 'challenges' && (
              <Challenges key="challenges" onNavigate={setCurrentScreen} />
            )}
            {currentScreen === 'profile' && (
              <Profile key="profile" onNavigate={setCurrentScreen} />
            )}
          </AnimatePresence>
        </div>
      </GameProvider>
    </DndProvider>
  )
}

export default App