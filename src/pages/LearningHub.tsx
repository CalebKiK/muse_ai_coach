/**
 * Learning hub page.
 * Brings together the core learn, review, and quiz flows.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  RotateCcw,
  Target,
  ArrowRight,
  Quote,
  Library,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store'

// Local quote library to avoid CSP issues.
const localQuotes = [
  { text: 'Learning compounds. Small, consistent steps lead to remarkable progress.', from: 'Muse' },
  { text: 'A journey of a thousand miles begins with steady steps.', from: 'Inspired by Xunzi' },
  { text: 'Diligence opens the path through every mountain of study.', from: 'Inspired by Han Yu' },
  { text: 'Read deeply and expression becomes more powerful.', from: 'Inspired by Du Fu' },
  { text: 'Learning without reflection is shallow; reflection without learning is empty.', from: 'Inspired by Confucius' },
  { text: 'Keep searching, even when the path feels long.', from: 'Inspired by Qu Yuan' },
  { text: 'Mastery grows through focus, discipline, and thought.', from: 'Inspired by Han Yu' },
  { text: 'Knowledge becomes real when you put it into practice.', from: 'Inspired by Lu You' },
  { text: 'What you build today becomes your strength tomorrow.', from: 'Muse' },
  { text: 'The best time to learn is now.', from: 'Muse' },
]

type TabType = 'learn' | 'review' | 'quiz'

interface TabConfig {
  id: TabType
  title: string
  description: string
  icon: React.ElementType
  color: string
  route: string
  badge?: string
}

const tabs: TabConfig[] = [
  {
    id: 'learn',
    title: 'Learn',
    description: 'Study new words',
    icon: BookOpen,
    color: 'blue',
    route: '/learn',
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Strengthen what you already know',
    icon: RotateCcw,
    color: 'green',
    route: '/review',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test what you have learned',
    icon: Target,
    color: 'purple',
    route: '/quiz',
  },
]

export default function LearningHub() {
  const { settings, updateSettings } = useAppStore()
  const [quote, setQuote] = useState(localQuotes[0])

  useEffect(() => {
    // Pick a random quote.
    const randomIndex = Math.floor(Math.random() * localQuotes.length)
    setQuote(localQuotes[randomIndex])
  }, [])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 Learning Hub
          </h1>
          <p className="text-gray-600">
            Learn, review, and quiz from one place
          </p>
        </motion.div>

        {/* Study mode selection */}
        <div className="grid md:grid-cols-3 gap-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const colorClasses = {
              blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
              green: { bg: 'bg-green-50', text: 'text-green-500' },
              purple: { bg: 'bg-purple-50', text: 'text-purple-500' },
            }
            const colors = colorClasses[tab.color as keyof typeof colorClasses]

            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={tab.route} className="block">
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${colors.bg} rounded-xl`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {tab.title}
                            </h3>
                            {tab.badge && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {tab.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:${colors.text} group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Quick access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/wordbook" className="block">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Library className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Word Books</h3>
                    <p className="text-gray-500 text-sm">Browse and manage your vocabulary collections</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Study settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Daily goal */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Daily learning goal</h3>
                <p className="text-gray-500 text-sm">How many new words to learn each day</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">📚</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => updateSettings({ dailyGoal: Math.max(5, settings.dailyGoal - 5) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">−</span>
              </button>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{settings.dailyGoal}</div>
                <div className="text-xs text-gray-500 mt-1">words/day</div>
              </div>

              <button
                onClick={() => updateSettings({ dailyGoal: Math.min(100, settings.dailyGoal + 5) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">+</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((value) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ dailyGoal: value })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.dailyGoal === value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Quick review size */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Quick review size</h3>
                <p className="text-gray-500 text-sm">How many words to include in each quick review</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <span className="text-violet-600 font-bold text-lg">⚡</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => updateSettings({ quickReviewLimit: Math.max(10, (settings.quickReviewLimit || 30) - 10) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">−</span>
              </button>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{settings.quickReviewLimit || 30}</div>
                <div className="text-xs text-gray-500 mt-1">words/session</div>
              </div>

              <button
                onClick={() => updateSettings({ quickReviewLimit: Math.min(100, (settings.quickReviewLimit || 30) + 10) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">+</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-2">
              {[20, 30, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ quickReviewLimit: value })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.quickReviewLimit === value
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Quote className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{quote.text}"
              </p>
              <p className="text-gray-400 text-xs mt-2 text-right">
                —— {quote.from}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
