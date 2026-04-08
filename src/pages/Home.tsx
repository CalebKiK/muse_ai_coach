import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  RefreshCw,
  Flame,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import StatCard from '../components/StatCard'

export default function Home() {
  const { profile, todayStats, settings, records, currentBook, getWordsToReview } = useAppStore()
  const [greeting, setGreeting] = useState('')
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    const loadReviewCount = async () => {
      const dueWords = await getWordsToReview()
      setReviewCount(dueWords.length)
    }
    loadReviewCount()
  }, [records, getWordsToReview])

  const dailyProgress = todayStats.newWords + todayStats.reviewedWords
  const totalMastered = Array.from(records.values()).filter(r => r.masteryLevel >= 3).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {greeting}, {profile?.nickname || 'Learner'} 👋
            </h1>
            <p className="text-white/80">
              {profile?.streak ? (
                <>You have studied for <span className="font-bold text-yellow-300">{profile.streak}</span> day(s) in a row. Keep it going.</>
              ) : (
                'Start today’s study session.'
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-bold">{profile?.streak || 0} days</span>
            </div>
          </div>
        </div>

        {/* Daily progress */}
        <div className="mt-6 bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80">Today’s progress</span>
            <span className="font-bold">{dailyProgress} / {settings.dailyGoal}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (dailyProgress / settings.dailyGoal) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="New today"
            value={todayStats.newWords}
            subtitle="words"
            icon={<BookOpen className="w-5 h-5" />}
            color="blue"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Reviewed today"
            value={todayStats.reviewedWords}
            subtitle="words"
            icon={<RefreshCw className="w-5 h-5" />}
            color="green"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Mastered"
            value={totalMastered}
            subtitle="words"
            icon={<Trophy className="w-5 h-5" />}
            color="purple"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Study time"
            value={todayStats.studyTime}
            subtitle="minutes"
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Start learning */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/learn">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Start learning</h3>
                    <p className="text-gray-500 text-sm">
                      {currentBook ? `Current word book: ${currentBook.name}` : 'Choose a word book to begin'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Review queue */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/review">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <RefreshCw className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Review words</h3>
                    <p className="text-gray-500 text-sm">
                      {reviewCount > 0 ? `${reviewCount} word(s) ready for review` : 'No words are waiting for review'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Study suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Study suggestion</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {reviewCount > 0
                ? `Start by reviewing ${Math.min(reviewCount, 20)} due words before learning new ones. Timely review will strengthen retention and make new study sessions more effective.`
                : dailyProgress < settings.dailyGoal
                ? `You only need ${settings.dailyGoal - dailyProgress} more word(s) to reach today’s goal.`
                : '🎉 Great work. You have completed today’s goal and can either rest or keep going.'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
