import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Trophy, Lock, Unlock, Loader2, Users, Check, X,
  BarChart3, RefreshCw, Crown, TrendingUp, List, Trash2,
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
  const [votingStage, setVotingStage] = useState('closed')
  const [results, setResults] = useState([])
  const [voterStatus, setVoterStatus] = useState([])
  const [detailedVotes, setDetailedVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState(null)
  const [resetting, setResetting] = useState(null)
  const [expandedVoter, setExpandedVoter] = useState(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const { data: statusData } = await supabase
        .from('election_status')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      setVotingStage(statusData?.voting_stage || 'closed')

      const { data: resultsData, error: resultsError } = await supabase.rpc('get_election_results')
      if (!resultsError && resultsData) {
        setResults(resultsData)
      }

      const { data: voterData, error: voterError } = await supabase.rpc('get_voter_status')
      if (!voterError && voterData) {
        setVoterStatus(voterData)
      }

      const { data: detailData, error: detailError } = await supabase.rpc('get_detailed_voter_status')
      if (!detailError && detailData) {
        setDetailedVotes(detailData)
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

  const setStage = async (newStage) => {
    setToggling(true)
    setMessage(null)
    try {
      const isOpen = newStage !== 'closed'
      const { error } = await supabase
        .from('election_status')
        .update({
          voting_stage: newStage,
          is_open: isOpen,
          opened_by: isOpen ? user.id : null,
          opened_at: isOpen ? new Date().toISOString() : null,
          closed_by: !isOpen ? user.id : null,
          closed_at: !isOpen ? new Date().toISOString() : null,
        })
        .eq('id', 1)

      if (error) throw error

      setVotingStage(newStage)
      const stageLabels = {
        'closed': 'ההצבעה נסגרה',
        'top1_5': 'שלב 1 נפתח - מקומות 1-5',
        'top5_10': 'שלב 2 נפתח - מקומות 6-10',
        'full': 'הצבעה מלאה נפתחה - מקומות 1-10',
      }
      setMessage({ type: 'success', text: stageLabels[newStage] || 'סטטוס עודכן' })
      loadData(true)
    } catch (err) {
      setMessage({ type: 'error', text: 'שגיאה בעדכון סטטוס הבחירות' })
    } finally {
      setToggling(false)
    }
  }

  const handleResetVotes = async (voterEmail) => {
    if (!confirm(`לאשר פסילת כל ההצבעות של ${voterEmail}? המשתמש יוכל להצביע מחדש.`)) return
    setResetting(voterEmail)
    setMessage(null)
    try {
      const { data, error } = await supabase.rpc('admin_reset_user_votes', { p_user_email: voterEmail })
      if (error) throw error
      if (data.success === false) {
        setMessage({ type: 'error', text: data.error || 'שגיאה בפסילת הצבעה' })
      } else {
        setMessage({ type: 'success', text: `ההצבעות של ${voterEmail} נמחקו. המשתמש יוכל להצביע מחדש.` })
        loadData(true)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'שגיאה בפסילת ההצבעה' })
    } finally {
      setResetting(null)
    }
  }

  const votedCount = voterStatus.filter((v) => v.has_voted).length
  const totalCount = voterStatus.length

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
            <span>יציאה</span>
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

        {/* Election Stage Control */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass-effect rounded-2xl p-6 mb-6 border-2 ${
            votingStage !== 'closed'
              ? 'border-green-500/50 shadow-lg shadow-green-500/10'
              : 'border-gray-700'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={votingStage !== 'closed' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                votingStage !== 'closed'
                  ? 'bg-gradient-to-br from-green-500 to-green-700'
                  : 'bg-gradient-to-br from-gray-600 to-gray-800'
              }`}
            >
              {votingStage !== 'closed' ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">
                {votingStage === 'full' ? 'הצבעה מלאה פעילה'
                  : votingStage === 'top1_5' ? 'שלב 1 פעיל: מקומות 1-5'
                  : votingStage === 'top5_10' ? 'שלב 2 פעיל: מקומות 6-10'
                  : 'ההצבעה סגורה'}
              </h2>
              <p className="text-gray-400 text-sm">
                {votingStage !== 'closed'
                  ? 'המשתמשים יכולים להצביע עכשיו'
                  : 'בחרו שלב הצבעה לפתיחה'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <button
              onClick={() => setStage('full')}
              disabled={toggling || votingStage === 'full'}
              className={`px-6 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                votingStage === 'full'
                  ? 'bg-purple-600 text-white shadow-purple-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
              }`}
            >
              <Unlock className="w-5 h-5" />
              פתח הצבעה מלאה (1-10)
            </button>
            <button
              onClick={() => setStage('top1_5')}
              disabled={toggling || votingStage === 'top1_5'}
              className={`px-6 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                votingStage === 'top1_5'
                  ? 'bg-green-600 text-white shadow-green-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
              }`}
            >
              <Unlock className="w-5 h-5" />
              פתח שלב 1 (1-5)
            </button>
            <button
              onClick={() => setStage('top5_10')}
              disabled={toggling || votingStage === 'top5_10'}
              className={`px-6 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                votingStage === 'top5_10'
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
              }`}
            >
              <Unlock className="w-5 h-5" />
              פתח שלב 2 (6-10)
            </button>
            <button
              onClick={() => setStage('closed')}
              disabled={toggling || votingStage === 'closed'}
              className={`px-6 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                votingStage === 'closed'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
              }`}
            >
              <Lock className="w-5 h-5" />
              סגור הצבעה
            </button>
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
          <StatCard icon={Users} label="בעלי זכות הצבעה" value={totalCount} color="from-blue-500 to-blue-700" />
          <StatCard icon={Check} label="הצביעו" value={votedCount} color="from-green-500 to-green-700" />
          <StatCard icon={X} label="טרם הצביעו" value={totalCount - votedCount} color="from-orange-500 to-orange-700" />
          <StatCard icon={TrendingUp} label="אחוז הצבעה" value={totalCount > 0 ? `${Math.round((votedCount / totalCount) * 100)}%` : '0%'} color="from-purple-500 to-purple-700" />
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

          {results.length === 0 || results.every((r) => r.total_points === 0) ? (
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

        {/* Voter Status with Details */}
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
              {voterStatus.map((voter, index) => {
                const voterDetail = detailedVotes
                  .filter((d) => d.user_email === voter.user_email)
                  .sort((a, b) => a.rank_position - b.rank_position)
                const isExpanded = expandedVoter === voter.user_email
                const votedAt = voterDetail.length > 0
                  ? new Date(voterDetail[0].voted_at).toLocaleString('he-IL', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })
                  : null

                return (
                  <motion.div
                    key={voter.user_email}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`rounded-lg ${
                      voter.has_voted
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-gray-800/30 border border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-gray-300 truncate" dir="ltr">{voter.user_email}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                          voter.has_voted_stage1 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'
                        }`} title="שלב 1">
                          <Check className="w-3 h-3" />1
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                          voter.has_voted_stage2 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-500'
                        }`} title="שלב 2">
                          <Check className="w-3 h-3" />2
                        </span>
                        {voter.has_voted && (
                          <button
                            onClick={() => setExpandedVoter(isExpanded ? null : voter.user_email)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                            title="פרטי הצבעה"
                          >
                            <List className="w-3 h-3" />
                          </button>
                        )}
                        {voter.has_voted && (
                          <button
                            onClick={() => handleResetVotes(voter.user_email)}
                            disabled={resetting === voter.user_email}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            title="פסול ומחק הצבעה"
                          >
                            {resetting === voter.user_email
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />}
                            פסול
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && voterDetail.length > 0 && (
                      <div className="px-4 pb-3 pt-1 border-t border-gray-700/30">
                        {votedAt && (
                          <p className="text-xs text-gray-500 mb-2">הצביע ב: {votedAt}</p>
                        )}
                        <div className="space-y-1">
                          {voterDetail.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-gray-800/40 rounded-md px-3 py-1.5">
                              <span className="text-gray-300">{d.candidate_name}</span>
                              <span className="text-blue-400 font-bold">
                                מקום {d.rank_position} · {POINTS[d.rank_position]} נקודות
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
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
