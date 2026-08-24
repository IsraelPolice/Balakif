import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy, Check, Loader2, Lock, Vote, AlertCircle, RotateCcw } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const POINTS = {
  1: 12, 2: 10, 3: 8, 4: 7, 5: 6,
  6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
}

export default function ElectionsVote({ user, onBack }) {
  const [candidates, setCandidates] = useState([])
  const [electionOpen, setElectionOpen] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [rankings, setRankings] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: candidatesData } = await supabase
        .from('election_candidates')
        .select('*')
        .order('display_order')

      setCandidates(candidatesData || [])

      const { data: statusData } = await supabase
        .from('election_status')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      setElectionOpen(statusData?.is_open || false)

      const { data: myVotes } = await supabase
        .from('election_votes')
        .select('candidate_id, rank_position')
        .eq('user_id', user.id)

      if (myVotes && myVotes.length > 0) {
        setHasVoted(true)
        const existingRankings = {}
        myVotes.forEach((v) => {
          existingRankings[v.candidate_id] = v.rank_position
        })
        setRankings(existingRankings)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const assignedRanks = Object.values(rankings)
  const ranks1to5Filled = [1, 2, 3, 4, 5].every((r) => assignedRanks.includes(r))
  const totalAssigned = assignedRanks.length

  const assignRank = (candidateId, rank) => {
    setRankings((prev) => {
      const next = { ...prev }
      const existingCandidateForRank = Object.entries(next).find(
        ([, r]) => r === rank
      )
      if (existingCandidateForRank) {
        delete next[existingCandidateForRank[0]]
      }
      const existingRankForCandidate = next[candidateId]
      if (existingRankForCandidate === rank) {
        delete next[candidateId]
      } else {
        next[candidateId] = rank
      }
      return next
    })
  }

  const clearRankings = () => {
    setRankings({})
    setHasVoted(false)
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!ranks1to5Filled) {
      setMessage({ type: 'error', text: 'חובה למלא את המקומות 1-5 לפחות' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const rankingsArray = Object.entries(rankings).map(([candidateId, rank]) => ({
        candidate_id: candidateId,
        rank: rank,
      }))

      const { data, error } = await supabase.rpc('submit_ballot', {
        p_rankings: rankingsArray,
      })

      if (error) throw error

      if (data.success === false) {
        setMessage({ type: 'error', text: data.error || 'שגיאה בשליחת ההצבעה' })
      } else {
        setHasVoted(true)
        setMessage({ type: 'success', text: 'ההצבעה נשלחה בהצלחה!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'שגיאה בשליחת ההצבעה' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!electionOpen && !hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Lock className="w-20 h-20 text-blue-400 mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">הבחירות טרם נפתחו</h2>
          <p className="text-gray-400 text-lg mb-8">
            האדמין צריך ללחוץ על "התחלת הבחירות" כדי שתוכלו להצביע.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            חזרה
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (hasVoted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-3">ההצבעה נקלטה!</h2>
          <p className="text-gray-400 text-lg mb-8">
            תודה שהצבעת. התוצאות יפורסמו לאחר סיום הבחירות.
          </p>

          <div className="glass-effect rounded-xl p-4 mb-6 text-right">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">ההצבעה שלך:</h3>
            <div className="space-y-2">
              {Object.entries(rankings)
                .sort(([, a], [, b]) => a - b)
                .map(([candidateId, rank]) => {
                  const candidate = candidates.find((c) => c.id === candidateId)
                  if (!candidate) return null
                  return (
                    <div key={candidateId} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-2">
                      <span className="font-semibold">{candidate.name}</span>
                      <span className="text-blue-400 font-bold">מקום {rank} · {POINTS[rank]} נקודות</span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowResults(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              צפייה בתוצאות
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
            >
              יציאה
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white" dir="rtl">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>חזרה</span>
          </motion.button>

          <div className="text-left">
            <span className="text-sm text-gray-400">מחובר: </span>
            <span className="text-sm text-blue-300">{user.email}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <Vote className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              בחירות 2026
            </h1>
          </div>
          <p className="text-gray-400">דרגו את המועמדים במקומות 1-5 (חובה) ו-6-10 (אופציונלי)</p>
        </motion.div>

        <div className="glass-effect rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${ranks1to5Filled ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className="text-sm">
              {ranks1to5Filled
                ? 'כל המקומות 1-5 מולאו - ניתן לשלוח!'
                : `חובה למלא מקומות 1-5 (מילאת ${[1, 2, 3, 4, 5].filter((r) => assignedRanks.includes(r)).length}/5)`}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            סה"כ דירוגים: {totalAssigned}/10
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-lg mb-6 text-center font-semibold ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3 mb-8">
          {candidates.map((candidate, index) => {
            const currentRank = rankings[candidate.id]
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`glass-effect rounded-xl p-4 transition-all ${
                  currentRank ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      currentRank
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {currentRank || candidate.display_order}
                    </div>
                    <span className="text-lg font-semibold">{candidate.name}</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <RankButton
                        key={rank}
                        rank={rank}
                        points={POINTS[rank]}
                        active={currentRank === rank}
                        disabled={assignedRanks.includes(rank) && currentRank !== rank}
                        onClick={() => assignRank(candidate.id, rank)}
                        required
                      />
                    ))}
                    {[6, 7, 8, 9, 10].map((rank) => (
                      <RankButton
                        key={rank}
                        rank={rank}
                        points={POINTS[rank]}
                        active={currentRank === rank}
                        disabled={assignedRanks.includes(rank) && currentRank !== rank}
                        onClick={() => assignRank(candidate.id, rank)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="flex gap-3 justify-center sticky bottom-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearRankings}
            className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            נקה
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!ranks1to5Filled || submitting}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Vote className="w-5 h-5" />
                שלח הצבעה
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function RankButton({ rank, points, active, disabled, onClick, required }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={onClick}
      disabled={disabled && !active}
      className={`relative w-11 h-11 rounded-lg font-bold text-sm transition-all ${
        active
          ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/40 scale-110'
          : disabled
          ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
          : required
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
      }`}
      title={`מקום ${rank} - ${points} נקודות`}
    >
      {rank}
      {active && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
        />
      )}
    </motion.button>
  )
}
