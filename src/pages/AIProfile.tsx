import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts'
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Heart,
  Lightbulb,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Network,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { getProfileManager } from '../services/ai-core'
import type { AILearnerProfile } from '../types/learner-profile'

export default function AIProfile() {
  const [profile, setProfile] = useState<AILearnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const manager = getProfileManager()
      const userId = 'user_' + Date.now() // TODO: Use the real user ID when auth is wired up

      const loadedProfile = await manager.initialize(userId)
      setProfile(loadedProfile)
      setError(null)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('Failed to load your profile.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceUpdate = async () => {
    try {
      setIsUpdating(true)
      const manager = getProfileManager()
      await manager.forceUpdate()
      await loadProfile()
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading your AI profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">{error || 'Unable to load your AI profile.'}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Cognitive style radar chart data
  const cognitiveData = [
    {
      subject: 'Visual',
      value: profile.cognitiveStyle.visualLearner,
      fullMark: 1,
    },
    {
      subject: 'Verbal',
      value: profile.cognitiveStyle.verbalLearner,
      fullMark: 1,
    },
    {
      subject: 'Contextual',
      value: profile.cognitiveStyle.contextualLearner,
      fullMark: 1,
    },
  ]

  // Forgetting-curve chart data
  const forgettingCurveData = profile.memoryPattern.forgettingCurve.map((value, index) => ({
    time: ['Now', '1 day', '3 days', '1 week', '2 weeks'][index] || `T${index}`,
    retention: value * 100,
    average: [100, 70, 50, 35, 25][index] || 0,
  }))

  // Emotional state chart data
  const emotionalData = [
    { name: 'Confidence', value: profile.emotionalState.confidence * 100, color: '#10b981' },
    { name: 'Motivation', value: profile.emotionalState.motivation * 100, color: '#8b5cf6' },
    { name: 'Flow', value: profile.emotionalState.flowScore * 100, color: '#3b82f6' },
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            My AI Profile
          </h1>
          <p className="text-gray-500 mt-1">Understand how you learn and personalize the experience around it</p>
        </div>
        <button
          onClick={handleForceUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Refreshing...' : 'Refresh profile'}
        </button>
      </div>

      {/* Profile summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">
              Profile version v{profile.version} · Last updated {new Date(profile.lastUpdated).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.knowledgeGraph.vocabularySize} word(s) learned · AI has analyzed your study patterns
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Link to statistics */}
      <Link
        to="/statistics"
        className="block bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-1">View study statistics</h3>
              <p className="text-blue-100 text-sm">See your progress and recent outcomes</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/80" />
        </div>
      </Link>

      {/* Profile cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Cognitive style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Cognitive style</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            See how you absorb and remember information most effectively
          </p>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={cognitiveData} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1]}
                  tick={false}
                  tickCount={5}
                />
                <Radar
                  name="Learning preference"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {profile.cognitiveStyle.visualLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-500">●</span>
                <span className="text-gray-600">Visual learner: images and diagrams help you most</span>
              </div>
            )}
            {profile.cognitiveStyle.contextualLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-500">●</span>
                <span className="text-gray-600">Contextual learner: rich context improves retention</span>
              </div>
            )}
            {profile.cognitiveStyle.verbalLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">●</span>
                <span className="text-gray-600">Verbal learner: text-based explanations fit you best</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 2. Memory pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Memory pattern</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your forgetting curve and optimal review cadence
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={forgettingCurveData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                stroke="#e5e7eb"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={false}
                stroke="#e5e7eb"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, 'Retention']}
              />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Your retention"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                dot={false}
                name="Average retention"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Best review interval</p>
              <p className="text-lg font-semibold text-blue-600">
                {profile.memoryPattern.optimalReviewInterval} hours
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Memory stability</p>
              <p className="text-lg font-semibold text-green-600">
                {(profile.memoryPattern.memoryStability * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. Study behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Study behavior</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your learning habits and strongest study windows
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best study window</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                {
                  {
                    morning: 'Morning',
                    afternoon: 'Afternoon',
                    evening: 'Evening',
                    night: 'Late night',
                  }[profile.behaviorPattern.preferredStudyTime]
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Typical session length</span>
              <span className="font-semibold text-gray-800">
                {profile.behaviorPattern.sessionDuration} minutes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average response time</span>
              <span className="font-semibold text-gray-800">
                {(profile.behaviorPattern.responseTime / 1000).toFixed(1)} sec
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consistency</span>
              <span className="font-semibold text-gray-800">
                {(profile.behaviorPattern.consistency * 100).toFixed(0)}%
              </span>
            </div>
            {profile.behaviorPattern.errorPatterns.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Common error patterns</p>
                <div className="flex flex-wrap gap-2">
                  {profile.behaviorPattern.errorPatterns.map((pattern, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 4. Knowledge map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">Knowledge map</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            What you know well and where gaps still exist
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Vocabulary size</span>
                <span className="text-lg font-bold text-green-600">
                  {profile.knowledgeGraph.vocabularySize}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (profile.knowledgeGraph.vocabularySize /
                        profile.learningGoals.targetVocabularySize) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            {profile.knowledgeGraph.masteredDomains.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Strong domains</p>
                <div className="flex flex-wrap gap-2">
                  {profile.knowledgeGraph.masteredDomains.map((domain, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.knowledgeGraph.weakDomains.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Weak domains</p>
                <div className="flex flex-wrap gap-2">
                  {profile.knowledgeGraph.weakDomains.map((domain, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 5. Emotional state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800">Current state</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            A live view of your confidence, motivation, and focus
          </p>
          <div className="space-y-3">
            {emotionalData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>
                    {item.value.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              {profile.emotionalState.flowScore > 0.7 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are in a flow state right now. Learning efficiency is high.</span>
                </div>
              )}
              {profile.emotionalState.frustration > 0.6 && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Frustration appears elevated. Consider resting or lowering the difficulty.</span>
                </div>
              )}
              {profile.emotionalState.motivation < 0.4 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Lightbulb className="w-4 h-4" />
                  <span>Motivation looks low. Try a new topic or a more playful mode.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 6. Learning goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800">Learning goals</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Track how close you are to your target
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Target level</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                  {profile.learningGoals.targetLevel.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {(profile.learningGoals.progressToGoal * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${profile.learningGoals.progressToGoal * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Current vocabulary</p>
                <p className="text-lg font-bold text-indigo-600">
                  {profile.knowledgeGraph.vocabularySize}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Target vocabulary</p>
                <p className="text-lg font-bold text-purple-600">
                  {profile.learningGoals.targetVocabularySize}
                </p>
              </div>
            </div>
            {profile.learningGoals.daysToDeadline > 0 && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time to goal</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {profile.learningGoals.daysToDeadline} days
                  </span>
                </div>
              </div>
            )}
            {profile.learningGoals.priorityTopics.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Priority topics</p>
                <div className="flex flex-wrap gap-2">
                  {profile.learningGoals.priorityTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Your profile keeps evolving</h3>
            <p className="text-purple-100 text-sm">
              As you continue learning, AI will keep refining this profile and improving the quality of its recommendations.
              Regular learning activity triggers fresh analysis so the profile reflects your latest habits and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
