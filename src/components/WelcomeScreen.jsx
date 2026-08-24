import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Users } from 'lucide-react'

function WelcomeScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-md mx-auto"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <Trophy className="w-24 h-24 mx-auto text-legendary mb-4" />
          <h1 className="text-4xl md:text-6xl font-black text-shadow mb-2 font-impact">
            החבר'ה הטובים
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-neon text-glow">
            ULTIMATE TEAM
          </h2>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <Star className="w-6 h-6 text-legendary" />
            <span className="text-lg">בנו את קבוצת החלומות</span>
          </div>
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <Users className="w-6 h-6 text-epic" />
            <span className="text-lg">21 שחקנים ייחודיים</span>
          </div>
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <Trophy className="w-6 h-6 text-neon" />
            <span className="text-lg">התחרו והשיגו תהילה</span>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full bg-gradient-to-r from-neon to-legendary text-primary font-bold text-xl py-4 px-8 rounded-xl shadow-2xl hover:shadow-neon/50 transition-all duration-300"
        >
          התחל משחק
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-gray-400 mt-4"
        >
          גרסה 1.0 • מותאם למובייל
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default WelcomeScreen