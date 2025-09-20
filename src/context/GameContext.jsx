import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { playersData } from '../data/players'

const GameContext = createContext()

const initialState = {
  coins: 150000000, // 150M starting budget
  squad: [],
  collection: [],
  challenges: [],
  stats: {
    packsOpened: 0,
    gamesPlayed: 0,
    wins: 0
  }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_GAME':
      return { ...state, ...action.payload }
    
    case 'ADD_TO_SQUAD':
      if (state.squad.length >= 5) return state
      return {
        ...state,
        squad: [...state.squad, action.payload]
      }
    
    case 'REMOVE_FROM_SQUAD':
      return {
        ...state,
        squad: state.squad.filter((_, index) => index !== action.payload)
      }
    
    case 'REPLACE_SQUAD_PLAYER':
      const newSquad = [...state.squad]
      newSquad[action.payload.index] = action.payload.player
      return {
        ...state,
        squad: newSquad
      }
    
    case 'SPEND_COINS':
      return {
        ...state,
        coins: Math.max(0, state.coins - action.payload)
      }
    
    case 'EARN_COINS':
      return {
        ...state,
        coins: state.coins + action.payload
      }
    
    case 'ADD_TO_COLLECTION':
      return {
        ...state,
        collection: [...state.collection, ...action.payload]
      }
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      }
    
    case 'CLEAR_SQUAD':
      return {
        ...state,
        squad: []
      }
    
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    // Load saved game state
    const savedState = localStorage.getItem('hevre-ultimate-team-state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        dispatch({ type: 'LOAD_GAME', payload: parsed })
      } catch (error) {
        console.error('Failed to load saved state:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save game state
    localStorage.setItem('hevre-ultimate-team-state', JSON.stringify(state))
  }, [state])

  const addToSquad = (player) => {
    if (state.squad.length < 5 && !state.squad.find(p => p.name === player.name)) {
      dispatch({ type: 'ADD_TO_SQUAD', payload: player })
      return true
    }
    return false
  }

  const removeFromSquad = (index) => {
    dispatch({ type: 'REMOVE_FROM_SQUAD', payload: index })
  }

  const replaceSquadPlayer = (index, player) => {
    dispatch({ type: 'REPLACE_SQUAD_PLAYER', payload: { index, player } })
  }

  const spendCoins = (amount) => {
    if (state.coins >= amount) {
      dispatch({ type: 'SPEND_COINS', payload: amount })
      return true
    }
    return false
  }

  const earnCoins = (amount) => {
    dispatch({ type: 'EARN_COINS', payload: amount })
  }

  const addToCollection = (players) => {
    dispatch({ type: 'ADD_TO_COLLECTION', payload: players })
  }

  const updateStats = (stats) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats })
  }

  const clearSquad = () => {
    dispatch({ type: 'CLEAR_SQUAD' })
  }

  const getSquadRating = () => {
    if (state.squad.length === 0) return 0
    return Math.round(state.squad.reduce((sum, player) => sum + player.rating, 0) / state.squad.length)
  }

  const getSquadValue = () => {
    return state.squad.reduce((sum, player) => sum + player.value, 0)
  }

  const value = {
    ...state,
    addToSquad,
    removeFromSquad,
    replaceSquadPlayer,
    spendCoins,
    earnCoins,
    addToCollection,
    updateStats,
    clearSquad,
    getSquadRating,
    getSquadValue,
    playersData
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}