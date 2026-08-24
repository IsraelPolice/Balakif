import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Trophy, Lock, Unlock, Loader2, Users, Check, X,
  BarChart3, RefreshCw, Crown, Award, TrendingUp,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const POINTS = {
  1: 12, 2: 10, 3: 8, 4: 7, 5: 6,
  6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
}

const MEDAL_COLORS = [
  'from-yellow-400 to-yellow-600',
  'from-gray-300 to-gray-500',
  'from-orange-400 to-orange-600',
]

export default function ElectionsAdmin({ user, onBack }) {
  const [electionOpen, setElectionOpen] = useState(false)
  const [results, setResults] = useState([])
  const [voterStatus, setVoterStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const { data: statusData } = await supabase
        .from('election_status')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      setElectionOpen(statusData?.is_open || false)

      const { data: resultsData, error: resultsError } = await supabase.rpc('get_election_results')
      if (!resultsError && resultsData) {
        setResults(resultsData)
      }

      const { data: voterData, error: voterError } = await supabase.rpc('get_voter_status')
      if (!voterError && voterData) {
        setVoterStatus(voterData)
      }
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const toggleElection = async () => {
    setToggling(true)
    setMessage(null)

    try {
      const newOpen = !electionOpen
      const { error } = await supabase
        .from('election_status')
        .update({
          is_open: newOpen,
          opened_by: newOpen ? user.id : null,
          opened_at: newOpen ? new Date().toISOString() : null,
          closed_by: !newOpen ? user.id : null,
          closed_at: !newOpen ? new Date().toISOString() : null,
        })
        .eq('id', 1)

      if (error) throw error

      setElectionOpen(newOpen)
      setMessage({
        type: 'success',
        text: newOpen ? 'הבחירות נפתחו! כל המשתמשים יכולים להצביע עכשיו.' : 'הבחירות נסגרו. ההצבעה הופסקה.',
      })
      loadData(true)
    } catch (err) {
      setMessage({ type: 'error', text: 'שגיאה בעדכון סטטוס הבחירות' })
    } finally {
      setToggling(false)
    }
  }

  const votedCount = voterStatus.filter((v) => v.has_voted).length
  const totalCount = voterStatus.length
  const totalBallots = results.reduce((sum, r) => sum + (r.total_ballots || 0), 0) > 0
    ? Math.max(...results.map((r) => r.rank1_votes + r.rank2_votes + r.rank3_votes + r.rank4_votes + r.rank5_votes + r.rank6_votes + r.rank7_votes + r.rank8_votes + r.rank9_votes + r.rank10_votes > 0 ? 1 : 0))
    : 0

  const actualVoters = results.length > 0
    ? results.reduce((max, r) => {
        const sum = r.rank1_votes + r.rank2_votes + r.rank3_votes + r.rank4_votes + r.rank5_votes + r.rank6_votes + r.rank7_votes + r.rank8_votes + r.rank9_votes + r.rank10_votes
        return Math.max(max, sum > 0 ? 1 : 0)
      }, 0)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>חזרה</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadData()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            רענן
          </motion.button>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              דשבורד אדמין
            </h1>
          </div>
          <p className="text-gray-400">בחירות 2026 - החבר'ה הטובים</p>
        </motion.div>

        {/* Election Control */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass-effect rounded-2xl p-6 mb-6 border-2 ${
            electionOpen ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={electionOpen ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  electionOpen
                    ? 'bg-gradient-to-br from-green-500 to-green-700'
                    : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}
              >
                {electionOpen ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">
                  {electionOpen ? 'הבחירות פתוחות' : 'הבחירות סגורות'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {electionOpen
                    ? 'כל המשתמשים יכולים להצביע עכשיו'
                    : 'ההצבעה נעולה - לחץ כדי לפתוח'}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleElection}
              disabled={toggling}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 ${
                electionOpen
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                  : 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-green-500/30'
              }`}
            >
              {toggling ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : electionOpen ? (
                <>
                  <Lock className="w-5 h-5" />
                  סגור בחירות
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  התחלת הבחירות
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="בעלי זכות הצבעה"
            value={totalCount}
            color="from-blue-500 to-blue-700"
          />
          <StatCard
            icon={Check}
            label="הצביעו"
            value={votedCount}
            color="from-green-500 to-green-700"
          />
          <StatCard
            icon={X}
            label="טרם הצביעו"
            value={totalCount - votedCount}
            color="from-orange-500 to-orange-700"
          />
          <StatCard
            icon={TrendingUp}
            label="אחוז הצבעה"
            value={totalCount > 0 ? `${Math.round((votedCount / totalCount) * 100)}%` : '0%'}
            color="from-purple-500 to-purple-700"
          />
        </div>

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-4 md:p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">תוצאות מפורטות</h2>
          </div>

          {results.length === 0 || (results.every((r) => r.total_points === 0)) ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">עדיין אין הצבעות</p>
              <p className="text-sm">התוצאות יופיעו כאן לאחר שמשתמשים יצביעו</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((row, index) => {
                const maxPoints = results[0]?.total_points || 1
                const barWidth = maxPoints > 0 ? (row.total_points / maxPoints) * 100 : 0

                return (
                  <motion.div
                    key={row.candidate_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-xl p-3 md:p-4 ${
                      index < 3
                        ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 border border-gray-600'
                        : 'bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        index < 3
                          ? `bg-gradient-to-br ${MEDAL_COLORS[index]} text-gray-900`
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {index < 3 ? <Crown className="w-5 h-5" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{row.candidate_name}</h3>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <div className="text-2xl font-black text-blue-400">{row.total_points}</div>
                        <div className="text-xs text-gray-500">נקודות</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full rounded-full ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-700'
                        }`}
                      />
                    </div>

                    {/* Rank breakdown */}
                    <div className="flex gap-1 flex-wrap">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => {
                        const votes = row[`rank${rank}_votes`] || 0
                        return (
                          <div
                            key={rank}
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                              votes > 0
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-gray-800/50 text-gray-600 border border-gray-700/30'
                            }`}
                            title={`מקום ${rank}: ${votes} הצבעות (${POINTS[rank]} נקודות כל אחד)`}
                          >
                            <span className="font-bold">{rank}</span>
                            <span>{votes}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Voter Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">סטטוס מצביעים</h2>
          </div>

          {voterStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין משתמשים רשומים</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {voterStatus.map((voter, index) => (
                <motion.div
                  key={voter.user_email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                    voter.has_voted
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-gray-800/30 border border-gray-700/30'
                  }`}
                >
                  <span className="text-sm text-gray-300 truncate" dir="ltr">{voter.user_email}</span>
                  {voter.has_voted ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm font-semibold flex-shrink-0">
                      <Check className="w-4 h-4" />
                      הצביע
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0">
                      <X className="w-4 h-4" />
                      טרם הצביע
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-4"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </motion.div>
  )
}
