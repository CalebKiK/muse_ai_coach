import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from './store'
import { onSync } from './storage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UpdateToast, CheckUpdateToast } from './components/UpdateToast'
import { createLogger } from './utils/logger'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Review from './pages/Review'
import WordBook from './pages/WordBook'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import About from './pages/About'
import AIQuiz from './pages/AIQuiz'
import SearchPage from './pages/SearchPage'
import AIProfile from './pages/AIProfile'
import FloatingWindow from './pages/FloatingWindow'
import TestAdaptiveEngine from './pages/TestAdaptiveEngine'
import TestContentGenerator from './pages/TestContentGenerator'
import CardGame from './pages/CardGame'
import GameHub from './pages/GameHub'
import LearningHub from './pages/LearningHub'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import StarFieldSplashScreen from './components/SplashScreen/StarField'

const logger = createLogger('App')

// Detect whether the app is running inside Electron
const isElectron = window.electronAPI !== undefined

function App() {
  const initialize = useAppStore((state) => state.initialize)
  const isLoading = useAppStore((state) => state.isLoading)
  const syncBooks = useAppStore((state) => state.syncBooks)
  const [splashComplete, setSplashComplete] = useState(false)

  // Update notification state
  const [updateInfo, setUpdateInfo] = useState<any>(null)
  const [checkUpdateStatus, setCheckUpdateStatus] = useState<{
    isChecking: boolean
    hasUpdate: boolean
    latestVersion?: string
  }>({ isChecking: false, hasUpdate: false })

  // Manual update check
  const handleManualCheckUpdate = async () => {
    if (!isElectron) return

    setCheckUpdateStatus({ isChecking: true, hasUpdate: false })

    try {
      const result = await window.electronAPI?.checkForUpdate()

      if (result?.hasUpdate) {
        setCheckUpdateStatus({
          isChecking: false,
          hasUpdate: true,
          latestVersion: result.latestVersion
        })
        setUpdateInfo(result)
      } else {
        setCheckUpdateStatus({
          isChecking: false,
          hasUpdate: false,
          latestVersion: result?.latestVersion
        })
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      setCheckUpdateStatus({ isChecking: false, hasUpdate: false })
    }
  }

  // Expose manual update checks for settings and other UI surfaces
  useEffect(() => {
    if (isElectron) {
      ;(window as any).checkForUpdate = handleManualCheckUpdate
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  // Listen for cross-window sync events
  useEffect(() => {
    const unsubscribe = onSync(() => {
      logger.info('Detected cross-window data changes, syncing...')
      syncBooks()
    })

    return unsubscribe
  }, [syncBooks])

  // Listen for update availability events
  useEffect(() => {
    if (!isElectron) return

    const unsubscribe = window.electronAPI?.onUpdateAvailable((info) => {
      logger.info('New version available:', info.latestVersion)
      setUpdateInfo(info)
    })

    return unsubscribe
  }, [])

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {!splashComplete && (
          <StarFieldSplashScreen
            key="splash"
            isReady={!isLoading}
            onEnter={() => setSplashComplete(true)}
          />
        )}
      </AnimatePresence>

      {splashComplete && (
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="learning" element={<LearningHub />} />
            <Route path="learn" element={<Learn />} />
            <Route path="review" element={<Review />} />
            <Route path="quiz" element={<AIQuiz />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="games" element={<GameHub />} />
            <Route path="card-game" element={<CardGame />} />
            <Route path="wordbook" element={<WordBook />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="ai-profile" element={<AIProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="test-adaptive" element={<TestAdaptiveEngine />} />
            <Route path="test-content" element={<TestContentGenerator />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>
          {/* Only show the floating window inside Electron */}
          {isElectron && <Route path="/floating" element={<FloatingWindow />} />}
        </Routes>
      )}

      {/* Update notification toast */}
      {updateInfo && (
        <UpdateToast
          updateInfo={updateInfo}
          onClose={() => setUpdateInfo(null)}
        />
      )}

      {/* Update check status toast */}
      {checkUpdateStatus.isChecking && (
        <CheckUpdateToast
          isChecking={checkUpdateStatus.isChecking}
          hasUpdate={checkUpdateStatus.hasUpdate}
          latestVersion={checkUpdateStatus.latestVersion}
          onDismiss={() => setCheckUpdateStatus({ isChecking: false, hasUpdate: false })}
        />
      )}
    </ErrorBoundary>
  )
}

export default App
