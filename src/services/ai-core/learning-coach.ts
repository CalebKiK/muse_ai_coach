/**
 * AI学习教练 - 主动提供学习建议和干预
 *
 * 功能:
 * 1. 疲劳检测 - 根据学习时长、错误率判断是否需要休息
 * 2. 困难模式识别 - 识别学习困难并调整策略
 * 3. 心流状态优化 - 保持用户在最佳学习状态
 * 4. 动机激励 - 提供鼓励和建议
 */

import type { AILearnerProfile } from '../../types/learner-profile'

export interface CoachIntervention {
  id: string
  type: 'rest' | 'difficulty' | 'motivation' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  actionable: boolean
  actionLabel?: string
  action?: () => void
  timestamp: number
}

export interface LearningSessionMetrics {
  sessionDuration: number // 毫秒
  wordsLearned: number
  correctCount: number
  incorrectCount: number
  averageResponseTime: number
  recentErrors: number // 最近10个词的错误数
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

export class LearningCoach {
  private lastInterventionTime: number = 0
  private interventionCooldown: number = 5 * 60 * 1000 // 5分钟冷却

  /**
   * 分析学习会话并生成教练建议
   */
  analyzeSession(metrics: LearningSessionMetrics, profile: AILearnerProfile): CoachIntervention | null {
    const now = Date.now()

    // 检查冷却时间
    if (now - this.lastInterventionTime < this.interventionCooldown) {
      return null
    }

    // 最少学习5个词后才进行检查（避免学1个词就触发）
    const totalAttempts = metrics.correctCount + metrics.incorrectCount
    if (totalAttempts < 5) {
      return null
    }

    // 优先级1: 检测疲劳
    const fatigueIntervention = this.checkFatigue(metrics, profile)
    if (fatigueIntervention) {
      this.lastInterventionTime = now
      return fatigueIntervention
    }

    // 优先级2: 检测困难模式
    const difficultyIntervention = this.checkDifficulty(metrics, profile)
    if (difficultyIntervention) {
      this.lastInterventionTime = now
      return difficultyIntervention
    }

    // 优先级3: 检测心流状态
    const flowIntervention = this.checkFlowState(metrics, profile)
    if (flowIntervention) {
      this.lastInterventionTime = now
      return flowIntervention
    }

    // 优先级4: 激励和建议
    const motivationIntervention = this.checkMotivation(metrics, profile)
    if (motivationIntervention) {
      this.lastInterventionTime = now
      return motivationIntervention
    }

    return null
  }

  /**
   * 检测疲劳 - 基于学习时长、错误率、反应时间
   *
   * 优化：增加最小学习词数要求
   */
  private checkFatigue(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const sessionMinutes = metrics.sessionDuration / (1000 * 60)
    const totalAttempts = metrics.correctCount + metrics.incorrectCount
    const accuracy = totalAttempts > 0 ? metrics.correctCount / totalAttempts : 1
    const avgResponseTimeSeconds = metrics.averageResponseTime / 1000

    // 至少学习5个词才检查疲劳
    if (totalAttempts < 5) {
      return null
    }

    // 疲劳指标
    const isLongSession = sessionMinutes > 30 // 超过30分钟（从25提高到30）
    const isHighErrorRate = totalAttempts >= 10 && accuracy < 0.5 // 至少10个词且正确率低于60%（从0.6改到0.5）
    const isSlowResponse = totalAttempts >= 10 && avgResponseTimeSeconds > 6 // 至少10个词且反应时间超过6秒（从5秒提高）
    const isConsecutiveErrors = metrics.consecutiveIncorrect >= 3 // 连续错误3次（保持）

    let fatigueScore = 0
    if (isLongSession) fatigueScore += 2
    if (isHighErrorRate) fatigueScore += 3
    if (isSlowResponse) fatigueScore += 2
    if (isConsecutiveErrors) fatigueScore += 3

    if (fatigueScore >= 5) {
      return {
        id: `fatigue-${Date.now()}`,
        type: 'rest',
        priority: 'high',
        title: 'Study fatigue detected',
        message: this.generateFatigueMessage(fatigueScore, sessionMinutes, accuracy),
        actionable: true,
        actionLabel: 'Take a break',
        action: () => {
          // 建议休息15分钟
          console.log('Suggesting a 15-minute break')
        },
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 生成疲劳提示消息
   */
  private generateFatigueMessage(fatigueScore: number, sessionMinutes: number, accuracy: number): string {
    if (fatigueScore >= 8) {
      return `You have been studying for ${Math.floor(sessionMinutes)} minutes and your accuracy has dropped to ${(accuracy * 100).toFixed(0)}%. A 15-30 minute break is strongly recommended.`
    } else if (fatigueScore >= 6) {
      return `You have been studying for more than ${Math.floor(sessionMinutes)} minutes and your focus appears to be slipping. Try a 10-minute break and reset.`
    } else {
      return `You have been studying continuously for ${Math.floor(sessionMinutes)} minutes. A short break could improve retention.`
    }
  }

  /**
   * 检测困难模式 - 基于错误率、连续错误、特定词类型
   *
   * 优化：提高触发门槛，避免过早建议降低难度
   */
  private checkDifficulty(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const totalAttempts = metrics.correctCount + metrics.incorrectCount
    const accuracy = totalAttempts > 0 ? metrics.correctCount / totalAttempts : 1

    // 困难指标（更严格的条件）
    const isLowAccuracy = totalAttempts >= 10 && accuracy < 0.4 // 至少10个词且正确率低于40%
    const isHighRecentErrors = totalAttempts >= 10 && metrics.recentErrors >= 7 // 至少10个词且最近错7个以上
    const isConsecutiveErrors = metrics.consecutiveIncorrect >= 5 // 连续错误5次（保持不变）

    if (isLowAccuracy || isHighRecentErrors || isConsecutiveErrors) {
      return {
        id: `difficulty-${Date.now()}`,
        type: 'difficulty',
        priority: 'high',
        title: 'Learning difficulty detected',
        message: this.generateDifficultyMessage(accuracy, metrics.consecutiveIncorrect),
        actionable: true,
        actionLabel: 'Lower difficulty',
        action: () => {
          console.log('Suggesting lower difficulty or a different study mode')
        },
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 生成困难模式提示消息
   */
  private generateDifficultyMessage(accuracy: number, consecutiveErrors: number): string {
    if (consecutiveErrors >= 4) {
      return `You missed ${consecutiveErrors} words in a row, which is completely normal. Try lowering the load or taking a break before continuing.`
    } else if (accuracy < 0.4) {
      return `Your current accuracy is ${(accuracy * 100).toFixed(0)}%. These words may be a bit too difficult right now, so try reviewing easier vocabulary first.`
    } else {
      return `You seem to be hitting a rough patch. That happens to every learner, so try switching to review mode to reinforce what you already know.`
    }
  }

  /**
   * 检测心流状态 - 优化学习体验
   */
  private checkFlowState(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const totalAttempts = metrics.correctCount + metrics.incorrectCount
    const accuracy = totalAttempts > 0 ? metrics.correctCount / totalAttempts : 1
    const avgResponseTimeSeconds = metrics.averageResponseTime / 1000

    // 心流状态指标
    const isOptimalAccuracy = totalAttempts > 0 && accuracy >= 0.7 && accuracy <= 0.9 // 70-90%正确率
    const isOptimalPace = avgResponseTimeSeconds >= 1.5 && avgResponseTimeSeconds <= 4 // 1.5-4秒反应时间
    const isLongStreak = metrics.consecutiveCorrect >= 10 // 连续正确10次

    if (isOptimalAccuracy && isOptimalPace) {
      return {
        id: `flow-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: 'You are in a strong flow state!',
        message: `Your study rhythm looks excellent. Accuracy is ${(accuracy * 100).toFixed(0)}% and the pace is balanced. Keep going.`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (isLongStreak) {
      return {
        id: `streak-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: `${metrics.consecutiveCorrect} correct in a row!`,
        message: `Great work. You have answered ${metrics.consecutiveCorrect} words correctly in a row, which suggests strong mastery in this area.`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 检测动机激励 - 提供鼓励和建议
   */
  private checkMotivation(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const sessionMinutes = metrics.sessionDuration / (1000 * 60)
    const wordsPerMinute = sessionMinutes > 0 ? metrics.wordsLearned / sessionMinutes : 0

    // 达成里程碑
    if (metrics.wordsLearned === 10) {
      return {
        id: `milestone-10-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '10 words completed',
        message: `Strong start. Keep this pace going. ${this.getEncouragement()}`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (metrics.wordsLearned === 20) {
      return {
        id: `milestone-20-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '20 words completed',
        message: `You are learning efficiently today. ${this.getEncouragement()}`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (metrics.wordsLearned === 50) {
      return {
        id: `milestone-50-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '50 words completed',
        message: `That is an impressive session. You have already studied 50 words today.`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    // 学习速度鼓励
    if (wordsPerMinute > 3 && sessionMinutes > 5) {
      return {
        id: `speed-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: 'Fast learning pace',
        message: `You are moving at ${wordsPerMinute.toFixed(1)} words per minute, which is well above average. Keep quality high as you go.`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 获取鼓励语句
   */
  private getEncouragement(): string {
    const encouragements = [
      'Small, steady progress adds up quickly.',
      'Every word you learn moves you closer to your goal.',
      'Consistency wins. You are building a strong vocabulary network.',
      'Trust the process and let the results follow.',
      'Your effort will pay off. Keep moving forward.',
    ]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }
}

// 导出单例
let coachInstance: LearningCoach | null = null

export const getLearningCoach = (): LearningCoach => {
  if (!coachInstance) {
    coachInstance = new LearningCoach()
  }
  return coachInstance
}
