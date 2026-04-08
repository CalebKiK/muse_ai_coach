/**
 * 自适应学习引擎 - AdaptiveLearningEngine
 *
 * 用AI预测替代传统的SM-2算法，实现个性化复习间隔计算
 *
 * 核心优势：
 * 1. 考虑用户的个性化遗忘曲线（而非固定公式）
 * 2. 考虑学习时段、情感状态、认知风格等因素
 * 3. 动态调整，越学越准确
 * 4. 基于AI的深度学习预测
 */

import { AILearnerProfile, LearningEvent } from '../../types/learner-profile';
import { aiService } from '../ai';

export interface AdaptiveReviewPlan {
  wordId: string;
  nextReviewAt: number;  // 下次复习时间戳
  interval: number;      // 复习间隔（小时）
  confidence: number;    // 预测置信度 0-1
  reasoning: string;     // AI推理过程
  difficulty: 'easy' | 'medium' | 'hard';  // 个性化难度评级
  suggestedAction: string;  // 建议的学习行动
}

export interface AdaptiveEngineConfig {
  enableAIPrediction: boolean;  // 是否启用AI预测
  fallbackToSM2: boolean;       // AI失败时是否回退到SM-2
  minInterval: number;          // 最小复习间隔（小时）
  maxInterval: number;          // 最大复习间隔（小时）
}

const DEFAULT_CONFIG: AdaptiveEngineConfig = {
  enableAIPrediction: true,
  fallbackToSM2: true,
  minInterval: 1,      // 1小时
  maxInterval: 720,    // 30天
};

export class AdaptiveLearningEngine {
  private config: AdaptiveEngineConfig;

  constructor(config: Partial<AdaptiveEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 核心方法：计算下次复习时间
   *
   * @param wordId - 单词ID
   * @param profile - 用户AI画像
   * @param wordHistory - 该单词的学习历史
   * @returns 个性化复习计划
   */
  async calculateNextReview(
    wordId: string,
    profile: AILearnerProfile | null,
    wordHistory: LearningEvent[]
  ): Promise<AdaptiveReviewPlan> {
    // 如果没有配置AI或没有画像数据，回退到SM-2
    if (!this.config.enableAIPrediction || !profile) {
      return this.fallbackToSM2(wordId, wordHistory);
    }

    try {
      // 使用AI预测个性化复习间隔
      return await this.predictWithAI(wordId, profile, wordHistory);
    } catch (error) {
      console.error('AI prediction failed. Falling back to SM-2:', error);
      if (this.config.fallbackToSM2) {
        return this.fallbackToSM2(wordId, wordHistory);
      }
      throw error;
    }
  }

  /**
   * 使用AI预测个性化复习间隔
   */
  private async predictWithAI(
    wordId: string,
    profile: AILearnerProfile,
    wordHistory: LearningEvent[]
  ): Promise<AdaptiveReviewPlan> {
    // 分析该单词的学习历史
    const historyAnalysis = this.analyzeWordHistory(wordHistory);

    // 构建AI提示词
    const prompt = this.buildPredictionPrompt(profile, wordHistory, historyAnalysis);

    // 调用AI分析
    const response = await aiService.chat([
      {
        role: 'system',
        content: `You are a memory-science expert with deep knowledge of forgetting curves and personalized review scheduling.
Use the learner's study data and profile to predict the best review interval.

You must return valid JSON in exactly this shape:
{
  "interval": integer hours,
  "confidence": decimal between 0 and 1,
  "difficulty": "easy" | "medium" | "hard",
  "reasoning": "brief explanation of the decision in under 25 words",
  "suggestedAction": "personalized study advice in under 20 words"
}

Consider:
1. Memory characteristics and the learner's forgetting pattern
2. Accuracy and response time for this word
3. Cognitive-style preferences
4. Preferred study window
5. Confidence and motivation signals

Output rules:
- interval must be between ${this.config.minInterval} and ${this.config.maxInterval} hours
- higher accuracy should generally increase the interval
- lower accuracy should shorten the interval
- faster responses suggest stronger recall
- slower responses suggest weaker recall
- return JSON only and no markdown`
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析AI响应
    const prediction = this.parsePrediction(response.content);

    // 计算下次复习时间
    const nextReviewAt = Date.now() + (prediction.interval * 60 * 60 * 1000);

    return {
      wordId,
      nextReviewAt,
      interval: prediction.interval,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      difficulty: prediction.difficulty,
      suggestedAction: prediction.suggestedAction
    };
  }

  /**
   * 构建AI预测提示词（优化版 - 添加动态决策框架）
   */
  private buildPredictionPrompt(
    profile: AILearnerProfile,
    _wordHistory: LearningEvent[],
    historyAnalysis: ReturnType<typeof AdaptiveLearningEngine.prototype.analyzeWordHistory>
  ): string {
    const memory = profile.memoryPattern;
    const behavior = profile.behaviorPattern;
    const emotional = profile.emotionalState;
    const intervalGuidance = this.getIntervalGuidance(historyAnalysis);

    return `## Task
Predict the best next review interval for this word in hours.

## Learner profile
**Memory**
- Forgetting curve: [${memory.forgettingCurve.map(v => v.toFixed(2)).join(', ')}]
- Best review interval: ${memory.optimalReviewInterval} hours
- Short-term retention: ${(memory.shortTermRetention * 100).toFixed(0)}%
- Long-term retention: ${(memory.longTermRetention * 100).toFixed(0)}%

**Study behavior**
- Best study window: ${behavior.preferredStudyTime}
- Typical session length: ${behavior.sessionDuration} minutes
- Consistency: ${(behavior.consistency * 100).toFixed(0)}%

**Emotional state**
- Confidence: ${(emotional.confidence * 100).toFixed(0)}%
- Motivation: ${(emotional.motivation * 100).toFixed(0)}%

## Word history
- Attempts: ${historyAnalysis.totalAttempts}
- Accuracy: ${(historyAnalysis.correctRate * 100).toFixed(1)}%
- Average response: ${historyAnalysis.avgResponseTime}ms
- Recent performance: ${historyAnalysis.recentPerformance}
- Last result: ${historyAnalysis.lastResult}

${intervalGuidance}

## Decision priorities
1. **Response-time weighting**: <1500ms x1.5, 1500-2500ms x1.2, 2500-4000ms x1.0, >4000ms x0.7
2. **Accuracy adjustment**: under 80% shortens the interval, above 90% extends it
3. **Emotional guardrails**: avoid aggressive difficulty when confidence is low
4. **Special case**: repeated errors should usually land in a 2-6 hour interval

## Output
Return valid JSON only, with no markdown fences:
{
  "interval": integer hours,
  "confidence": decimal between 0 and 1,
  "difficulty": "easy" | "medium" | "hard",
  "reasoning": "brief explanation in under 25 words",
  "suggestedAction": "personalized study advice in under 20 words"
}`;
  }

  /**
   * 获取时间范围指导（新增）
   */
  private getIntervalGuidance(historyAnalysis: ReturnType<typeof AdaptiveLearningEngine.prototype.analyzeWordHistory>): string {
    const { totalAttempts, correctRate, avgResponseTime } = historyAnalysis;

    let baseInterval = 24;
    let guidance = '## Interval guidance\n';

    if (totalAttempts === 1) {
      baseInterval = 4;
      guidance += `- First exposure -> recommend 4 hours (range: 2-12 hours)\n`;
    } else if (totalAttempts <= 3) {
      if (correctRate >= 0.8) {
        baseInterval = 24;
        guidance += `- Early stage + high accuracy -> recommend 24 hours (range: 12-48 hours)\n`;
      } else {
        baseInterval = 4;
        guidance += `- Early stage + low accuracy -> recommend 4 hours (range: 2-12 hours)\n`;
      }
    } else if (totalAttempts <= 10) {
      if (correctRate >= 0.9) {
        baseInterval = 120;
        guidance += `- Mid stage + strong mastery -> recommend 120 hours / 5 days (range: 3-7 days)\n`;
      } else {
        baseInterval = 24;
        guidance += `- Mid stage + weak mastery -> recommend 24 hours (range: 12-48 hours)\n`;
      }
    } else {
      if (correctRate >= 0.95) {
        baseInterval = 336;
        guidance += `- Long-term memory + excellent mastery -> recommend 336 hours / 14 days (range: 7-30 days)\n`;
      } else {
        baseInterval = 48;
        guidance += `- Long-term memory + average mastery -> recommend 48 hours / 2 days (range: 1-5 days)\n`;
      }
    }

    // 反应时间调整
    const timeAdjustment = avgResponseTime < 1500 ? 'x1.5 (extend by 50%)' :
                          avgResponseTime < 2500 ? 'x1.2 (extend by 20%)' :
                          avgResponseTime < 4000 ? 'x1.0 (no change)' : 'x0.7 (shorten by 30%)';

    guidance += `\n**Base interval**: ${baseInterval} hours\n`;
    guidance += `**Response-time adjustment**: ${avgResponseTime}ms -> ${timeAdjustment}`;

    return guidance;
  }

  /**
   * 分析单词学习历史
   */
  private analyzeWordHistory(history: LearningEvent[]) {
    if (history.length === 0) {
      return {
        totalAttempts: 0,
        correctRate: 0,
        avgResponseTime: 0,
        recentPerformance: 'First exposure',
        lastAction: 'none',
        lastResult: 'none',
        timeSinceLastEvent: Infinity
      };
    }

    const recentEvents = history.slice(-5); // 最近5次
    const correctCount = history.filter(e => e.result === 'correct').length;
    const avgResponseTime = history.reduce((sum, e) => sum + e.timeTaken, 0) / history.length;
    const recentCorrectCount = recentEvents.filter(e => e.result === 'correct').length;
    const lastEvent = history[history.length - 1];

    // 最近表现评估
    let recentPerformance = 'Average';
    if (recentCorrectCount === 5) recentPerformance = 'Excellent';
    else if (recentCorrectCount >= 3) recentPerformance = 'Good';
    else if (recentCorrectCount <= 1) recentPerformance = 'Weak';

    // 距离上次学习的小时数
    const timeSinceLastEvent = (Date.now() - lastEvent.timestamp) / (1000 * 60 * 60);

    return {
      totalAttempts: history.length,
      correctRate: correctCount / history.length,
      avgResponseTime: Math.round(avgResponseTime),
      recentPerformance,
      lastAction: lastEvent.action,
      lastResult: lastEvent.result,
      timeSinceLastEvent
    };
  }

  /**
   * 解析AI预测响应
   */
  private parsePrediction(content: string): {
    interval: number;
    confidence: number;
    difficulty: 'easy' | 'medium' | 'hard';
    reasoning: string;
    suggestedAction: string;
  } {
    try {
      // 清理响应内容
      let jsonStr = content.trim();
      // 移除markdown代码块标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // 提取JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 验证并调整interval在合理范围内
        let interval = Math.max(
          this.config.minInterval,
          Math.min(this.config.maxInterval, parsed.interval || 24)
        );

        return {
          interval,
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
          difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty)
            ? parsed.difficulty
            : 'medium',
          reasoning: parsed.reasoning || 'AI-based personalized review prediction',
          suggestedAction: parsed.suggestedAction || 'Review on time to strengthen retention'
        };
      }
    } catch (error) {
      console.error('Failed to parse AI prediction:', error);
    }

    // 返回默认值
    return {
      interval: 24,
      confidence: 0.5,
      difficulty: 'medium',
      reasoning: 'Using the default review interval',
      suggestedAction: 'Review on schedule'
    };
  }

  /**
   * 回退到SM-2算法
   */
  private fallbackToSM2(
    wordId: string,
    history: LearningEvent[]
  ): AdaptiveReviewPlan {
    // 简化版SM-2算法
    const correctCount = history.filter(e => e.result === 'correct').length;
    const incorrectCount = history.filter(e => e.result === 'incorrect').length;

    // 基础间隔（小时）
    let interval = 24; // 默认1天

    if (correctCount >= 3) {
      interval = 24 * Math.pow(2, correctCount - 2); // 2的幂次增长
    } else if (incorrectCount > 0) {
      interval = 12; // 错误后缩短为半天
    }

    // 限制在合理范围内
    interval = Math.max(this.config.minInterval, Math.min(this.config.maxInterval, interval));

    const nextReviewAt = Date.now() + (interval * 60 * 60 * 1000);

    return {
      wordId,
      nextReviewAt,
      interval: Math.round(interval),
      confidence: 0.6,
      reasoning: 'Using the traditional SM-2 fallback',
      difficulty: correctCount >= 3 ? 'easy' : correctCount >= 1 ? 'medium' : 'hard',
      suggestedAction: 'Follow the planned review schedule'
    };
  }

  /**
   * 批量计算多个单词的复习计划
   */
  async calculateBatch(
    items: Array<{ wordId: string; history: LearningEvent[] }>,
    profile: AILearnerProfile | null
  ): Promise<AdaptiveReviewPlan[]> {
    // 如果没有AI，逐个使用SM-2
    if (!this.config.enableAIPrediction || !profile) {
      return items.map(item =>
        this.fallbackToSM2(item.wordId, item.history)
      );
    }

    // 使用AI批量预测（提示词包含多个单词）
    try {
      return await this.predictBatchWithAI(items, profile);
    } catch (error) {
      console.error('Batch AI prediction failed. Falling back to per-word prediction:', error);
      // 降级到逐个预测
      const results: AdaptiveReviewPlan[] = [];
      for (const item of items) {
        const plan = await this.calculateNextReview(item.wordId, profile, item.history);
        results.push(plan);
      }
      return results;
    }
  }

  /**
   * 批量AI预测（更高效）
   */
  private async predictBatchWithAI(
    items: Array<{ wordId: string; history: LearningEvent[] }>,
    profile: AILearnerProfile
  ): Promise<AdaptiveReviewPlan[]> {
    // 为每个单词构建简要信息
    const wordsSummary = items.map(item => {
      const analysis = this.analyzeWordHistory(item.history);
      return {
        wordId: item.wordId,
        attempts: analysis.totalAttempts,
        correctRate: (analysis.correctRate * 100).toFixed(1) + '%',
        avgTime: analysis.avgResponseTime + 'ms',
        recent: analysis.recentPerformance
      };
    });

    const prompt = `Predict the best review interval in hours for these ${items.length} words.

**Learner profile**
- Best review interval: ${profile.memoryPattern.optimalReviewInterval} hours
- Memory stability: ${profile.memoryPattern.memoryStability.toFixed(2)}
- Preferred study window: ${profile.behaviorPattern.preferredStudyTime}

**Words**
${wordsSummary.map((w, i) => `${i + 1}. ${w.wordId}: ${w.attempts} attempt(s), accuracy ${w.correctRate}, recent performance ${w.recent}`).join('\n')}

Return a JSON array like this:
[
  {
    "wordId": "word id",
    "interval": integer hours,
    "difficulty": "easy" | "medium" | "hard"
  }
]

Return the JSON array only.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: `You are a memory-science expert. Predict review intervals in batch and return a JSON array only.`
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return this.parseBatchPrediction(response.content, items);
  }

  /**
   * 解析批量预测响应
   */
  private parseBatchPrediction(
    content: string,
    items: Array<{ wordId: string; history: LearningEvent[] }>
  ): AdaptiveReviewPlan[] {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const predictions = JSON.parse(jsonMatch[0]);

        return predictions.map((pred: any, index: number) => {
          const wordId = items[index].wordId;
          const interval = Math.max(
            this.config.minInterval,
            Math.min(this.config.maxInterval, Math.round(pred.interval) || 24)
          );

          return {
            wordId,
            nextReviewAt: Date.now() + (interval * 60 * 60 * 1000),
            interval,
            confidence: 0.7,
            reasoning: 'Batch AI review prediction',
            suggestedAction: 'Review on schedule',
            difficulty: pred.difficulty || 'medium'
          };
        });
      }
    } catch (error) {
      console.error('Failed to parse batch prediction:', error);
    }

    // 解析失败，返回默认计划
    return items.map(item => this.fallbackToSM2(item.wordId, item.history));
  }

  /**
   * 更新引擎配置
   */
  updateConfig(config: Partial<AdaptiveEngineConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AdaptiveEngineConfig {
    return { ...this.config };
  }
}

// 导出单例
export const adaptiveEngine = new AdaptiveLearningEngine();
