import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, Medal, Star, Film, Award, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function AcademyAwards({ onBack }) {
  const [categories, setCategories] = useState([]);
  const [nominees, setNominees] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [adminCode, setAdminCode] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('award_categories')
        .select('*')
        .order('display_order');

      const { data: nomineesData } = await supabase
        .from('award_nominees')
        .select('*')
        .order('display_order');

      setCategories(categoriesData || []);

      const nomineesByCategory = {};
      (nomineesData || []).forEach(nominee => {
        if (!nomineesByCategory[nominee.category_id]) {
          nomineesByCategory[nominee.category_id] = [];
        }
        nomineesByCategory[nominee.category_id].push(nominee);
      });
      setNominees(nomineesByCategory);

      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const checkAdminCode = async () => {
    if (adminCode === '316439249') {
      setShowAdmin(true);
      await loadVoteCounts();
    } else {
      setMessage({ type: 'error', text: 'קוד שגוי' });
    }
  };

  const loadVoteCounts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_vote_counts');
      if (error) throw error;

      const counts = {};
      (data || []).forEach(vote => {
        if (!counts[vote.category_id]) {
          counts[vote.category_id] = {};
        }
        counts[vote.category_id][vote.nominee_id] = vote.vote_count;
      });
      setVoteCounts(counts);
    } catch (error) {
      console.error('Error loading vote counts:', error);
    }
  };

  const handleVote = async () => {
    if (!email || !phone || !selectedNominee) {
      setMessage({ type: 'error', text: 'נא למלא את כל השדות' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'כתובת מייל לא תקינה' });
      return;
    }

    setVoting(true);

    try {
      const { data: hasVoted } = await supabase.rpc('has_voted_in_category', {
        p_email: email,
        p_category_id: selectedCategory.id
      });

      if (hasVoted) {
        setMessage({ type: 'error', text: 'כבר הצבעת בקטגוריה זו' });
        setVoting(false);
        return;
      }

      const { error } = await supabase
        .from('award_votes')
        .insert({
          category_id: selectedCategory.id,
          nominee_id: selectedNominee,
          voter_email: email,
          voter_phone: phone
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'ההצבעה נשלחה בהצלחה!' });
      setTimeout(() => {
        setSelectedCategory(null);
        setEmail('');
        setPhone('');
        setSelectedNominee(null);
        setMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error voting:', error);
      setMessage({ type: 'error', text: 'שגיאה בשליחת ההצבעה' });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center">
        <div className="text-yellow-300 text-2xl">טוען...</div>
      </div>
    );
  }

  if (selectedCategory) {
    const videoId = extractYouTubeId(selectedCategory.video_url);
    const categoryNominees = nominees[selectedCategory.id] || [];
    const categoryVotes = voteCounts[selectedCategory.id] || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white" dir="rtl">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>חזרה לכל הקטגוריות</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-yellow-600/30"
          >
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10" />
                {selectedCategory.name}
              </h2>
            </div>

            {videoId && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={selectedCategory.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-yellow-400">המועמדים</h3>

              <div className="grid gap-4 mb-8">
                {categoryNominees.map((nominee) => {
                  const voteCount = categoryVotes[nominee.id] || 0;
                  const totalVotes = Object.values(categoryVotes).reduce((a, b) => a + b, 0);
                  const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;

                  return (
                    <motion.button
                      key={nominee.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedNominee(nominee.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedNominee === nominee.id
                          ? 'border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/30'
                          : 'border-gray-700 bg-gray-800/50 hover:border-yellow-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedNominee === nominee.id
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-600'
                          }`}>
                            {selectedNominee === nominee.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 bg-white rounded-full"
                              />
                            )}
                          </div>
                          <span className="text-xl font-semibold">{nominee.name}</span>
                        </div>
                        {showAdmin && (
                          <div className="text-left">
                            <div className="text-yellow-400 font-bold text-lg">{voteCount} קולות</div>
                            <div className="text-gray-400 text-sm">{percentage}%</div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-lg mb-4 text-center font-semibold ${
                      message.type === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="המייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-right"
                />
                <input
                  type="tel"
                  placeholder="מספר הטלפון שלך"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-right"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVote}
                  disabled={voting || !selectedNominee}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-xl rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-yellow-500/50 transition-all"
                >
                  {voting ? 'שולח...' : 'הצבע עכשיו'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>חזרה לתפריט הראשי</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <img
            src="https://i.ibb.co/C3zyqv4F/Chat-GPT-Image-Oct-22-2025-04-33-19-PM.png"
            alt="פרסי האקדמיה"
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl mb-8"
          />

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent"
          >
            פרסי האקדמיה
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300"
          >
            החבר'ה הטובים
          </motion.p>
        </motion.div>

        <div className="mb-8 flex justify-center">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-300">יש לך קוד מנהל?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="הזן קוד"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-yellow-500 focus:outline-none text-right"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkAdminCode}
                className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                בדוק
              </motion.button>
            </div>
            {showAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center text-green-400 font-semibold flex items-center justify-center gap-2"
              >
                <EyeOff className="w-5 h-5" />
                מצב מנהל פעיל - תוצאות גלויות
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const icon = {
              0: Trophy,
              1: Medal,
              2: Star,
              3: Film,
              4: Award,
              5: Film,
              6: Star,
              7: Film
            }[index] || Trophy;
            const Icon = icon;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-yellow-600/30 hover:border-yellow-500 transition-all group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/50 transition-shadow">
                    <Icon className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">{category.name}</h3>
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full" />
                  <span className="text-yellow-400 font-semibold group-hover:text-yellow-300 transition-colors">
                    לחץ להצבעה
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
