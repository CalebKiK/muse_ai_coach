/**
 * 个性化内容生成器 - PersonalizedContentGenerator
 *
 * 根据用户画像生成个性化的学习内容:
 * 1. 动态例句生成
 * 2. 记忆技巧生成
 * 3. 释义难度适配
 *
 * 核心优势:
 * - 根据认知风格生成内容
 * - 基于词汇量调整难度
 * - 提供个性化学习建议
 */

import { aiService } from '../ai';
import type {
  ContentGenerationRequest,
  GeneratedExample,
  GeneratedMemoryTip,
  GeneratedExplanation,
  BatchContentRequest,
  ContentGeneratorConfig,
  ContentCacheItem,
  ContentGeneratorState
} from '../../types/personalized-content';
import type { CognitiveStyle } from '../../types/learner-profile';

const DEFAULT_CONFIG: ContentGeneratorConfig = {
  enableExamples: true,
  enableMemoryTips: true,
  enableAdaptiveDifficulty: true,
  maxExamples: 3,
  cacheEnabled: true,
  cacheTTL: 3600, // 1小时
};

/**
 * 个性化内容生成器
 */
export class PersonalizedContentGenerator {
  private config: ContentGeneratorConfig;
  private cache: Map<string, ContentCacheItem>;
  private state: ContentGeneratorState;

  constructor(config: Partial<ContentGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
    this.state = {
      totalGenerated: 0,
      cacheHitRate: 0,
      averageGenerationTime: 0,
      lastGeneratedAt: 0,
    };
  }

  /**
   * 生成例句
   */
  async generateExample(request: ContentGenerationRequest): Promise<GeneratedExample> {
    const cacheKey = this.getCacheKey('example', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedExample;
    }

    const startTime = Date.now();

    // 根据认知风格选择生成策略
    const style = this.determineContentStyle(request.profile.cognitiveStyle);

    // 构建AI提示词
    const prompt = this.buildExamplePrompt(request, style);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getExampleSystemPrompt(style)
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const example = this.parseExample(response.content, style);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: example,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return example;
  }

  /**
   * 生成记忆技巧
   */
  async generateMemoryTip(request: ContentGenerationRequest): Promise<GeneratedMemoryTip> {
    const cacheKey = this.getCacheKey('memoryTip', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedMemoryTip;
    }

    const startTime = Date.now();

    // 根据用户特征选择最佳技巧类型
    const technique = this.selectBestTechnique(request);

    // 构建AI提示词
    const prompt = this.buildMemoryTipPrompt(request, technique);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getMemoryTipSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const memoryTip = this.parseMemoryTip(response.content);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: memoryTip,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return memoryTip;
  }

  /**
   * 生成释义
   */
  async generateExplanation(request: ContentGenerationRequest): Promise<GeneratedExplanation> {
    const cacheKey = this.getCacheKey('explanation', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedExplanation;
    }

    const startTime = Date.now();

    // 根据词汇量确定难度级别
    const difficulty = this.determineDifficulty(request);

    // 构建AI提示词
    const prompt = this.buildExplanationPrompt(request, difficulty);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getExplanationSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const explanation = this.parseExplanation(response.content);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: explanation,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return explanation;
  }

  /**
   * 批量生成内容
   */
  async generateBatch(batchRequest: BatchContentRequest): Promise<Map<string, GeneratedExample | GeneratedMemoryTip | GeneratedExplanation>> {
    const results = new Map();

    for (const wordData of batchRequest.words) {
      for (const contentType of batchRequest.contentTypes) {
        const request: ContentGenerationRequest = {
          ...wordData,
          profile: batchRequest.profile,
          contentType
        };

        let content;
        switch (contentType) {
          case 'example':
            content = await this.generateExample(request);
            break;
          case 'memoryTip':
            content = await this.generateMemoryTip(request);
            break;
          case 'explanation':
            content = await this.generateExplanation(request);
            break;
        }

        results.set(`${wordData.wordId}_${contentType}`, content);
      }
    }

    return results;
  }

  /**
   * 确定内容风格(基于认知风格)
   */
  private determineContentStyle(cognitiveStyle: CognitiveStyle): 'visual' | 'linguistic' | 'contextual' {
    const { visualLearner, verbalLearner, contextualLearner } = cognitiveStyle;

    if (visualLearner > verbalLearner && visualLearner > contextualLearner) {
      return 'visual';
    } else if (verbalLearner > contextualLearner) {
      return 'linguistic';
    } else {
      return 'contextual';
    }
  }

  /**
   * 选择最佳记忆技巧
   */
  private selectBestTechnique(request: ContentGenerationRequest): GeneratedMemoryTip['technique'] {
    const { cognitiveStyle } = request.profile;

    // 视觉型学习者: 优先使用联想和场景记忆
    if (cognitiveStyle.visualLearner > 0.7) {
      return Math.random() > 0.5 ? 'association' : 'scene';
    }

    // 语言型学习者: 优先使用词根词缀
    if (cognitiveStyle.verbalLearner > 0.7) {
      return 'wordRoot';
    }

    // 情境型学习者: 优先使用场景和故事
    if (cognitiveStyle.contextualLearner > 0.7) {
      return Math.random() > 0.5 ? 'scene' : 'story';
    }

    // 默认随机选择
    const techniques: GeneratedMemoryTip['technique'][] = ['association', 'wordRoot', 'scene', 'story', 'mnemonic'];
    return techniques[Math.floor(Math.random() * techniques.length)];
  }

  /**
   * 确定难度级别(基于词汇量)
   */
  private determineDifficulty(request: ContentGenerationRequest): 'beginner' | 'intermediate' | 'advanced' {
    // 基于词汇量大小估算难度
    const vocabSize = request.profile.knowledgeGraph.vocabularySize;

    if (vocabSize < 500) {
      return 'beginner';
    } else if (vocabSize < 2000) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * 构建例句生成提示词
   */
  private buildExamplePrompt(request: ContentGenerationRequest, style: 'visual' | 'linguistic' | 'contextual'): string {
    const { word, definition } = request;

    let styleGuidance = '';
    switch (style) {
      case 'visual':
        styleGuidance = 'The sentence should include vivid scene-setting details that are easy to picture.';
        break;
      case 'linguistic':
        styleGuidance = 'The sentence should clearly show grammar, usage, and common collocations.';
        break;
      case 'contextual':
        styleGuidance = 'The sentence should provide realistic context and a believable usage scenario.';
        break;
    }

    return `Generate an example sentence for this word.

**Word**: ${word}
**Definition**: ${definition}
**Style guidance**: ${styleGuidance}

Requirements:
1. The sentence must sound natural and native-like.
2. It should show practical real-world usage.
3. Keep the difficulty moderate.
4. ${styleGuidance}

Return valid JSON in exactly this shape:
{
  "sentence": "English example sentence",
  "translation": "English-friendly learner translation or paraphrase",
  "scenario": "short usage scenario description",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "style": "visual" | "linguistic" | "contextual"
}`;
  }

  /**
   * 构建记忆技巧提示词
   */
  private buildMemoryTipPrompt(request: ContentGenerationRequest, technique: GeneratedMemoryTip['technique']): string {
    const { word, definition, profile } = request;
    const techniqueNames = {
      association: 'association method',
      wordRoot: 'word root method',
      scene: 'scene-based memory',
      story: 'story method',
      mnemonic: 'mnemonic method'
    };

    return `Generate a memory technique for this word.

**Word**: ${word}
**Definition**: ${definition}
**Learner vocabulary size**: ${profile.knowledgeGraph.vocabularySize} words
**Technique type**: ${techniqueNames[technique]}

Create a helpful technique based on the ${techniqueNames[technique]} to help the learner remember the word quickly.

Return valid JSON in exactly this shape:
{
  "technique": "${technique}",
  "title": "short title",
  "content": "detailed memory tip explanation",
  "effectiveness": 0.8,
  "estimatedTime": 5
}`;
  }

  /**
   * 构建释义提示词
   */
  private buildExplanationPrompt(request: ContentGenerationRequest, difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
    const { word, definition } = request;
    const difficultyGuidance = {
      beginner: 'Use very simple English and avoid technical wording.',
      intermediate: 'Use clear English with slightly richer vocabulary and light scaffolding.',
      advanced: 'Use fully English explanations and include synonyms and antonyms.'
    };

    return `Generate a level-appropriate explanation for this word.

**Word**: ${word}
**Source definition**: ${definition}
**Difficulty level**: ${difficulty}
**Guidance**: ${difficultyGuidance[difficulty]}

Include:
1. A definition or explanation
2. 2-3 synonyms
3. 1-2 antonyms
4. 2-3 useful collocations

Return valid JSON in exactly this shape:
{
  "definition": "definition content",
  "difficulty": "${difficulty}",
  "synonyms": ["synonym 1", "synonym 2"],
  "antonyms": ["antonym 1"],
  "collocations": ["collocation 1", "collocation 2"]
}`;
  }

  /**
   * 获取例句系统提示词
   */
  private getExampleSystemPrompt(style: 'visual' | 'linguistic' | 'contextual'): string {
    return `You are an English teaching expert who writes ${style === 'visual' ? 'vivid and image-rich' : style === 'linguistic' ? 'usage-focused and grammar-aware' : 'realistic and context-rich'} example sentences.

Your task is to generate a personalized example sentence based on the target word and the learner's cognitive style.

Requirements:
1. The sentence must sound natural to native speakers.
2. Keep the difficulty moderate.
3. Make the practical meaning and usage clear.
4. ${style === 'visual' ? 'Include scene-setting details that are easy to visualize.' : ''}
  ${style === 'linguistic' ? 'Show grammar, syntax, and collocation naturally.' : ''}
  ${style === 'contextual' ? 'Provide believable context and a realistic situation.' : ''}

Return JSON only.`;
  }

  /**
   * 获取记忆技巧系统提示词
   */
  private getMemoryTipSystemPrompt(): string {
    return `You are a memory-science expert who specializes in practical vocabulary retention techniques.

Your task is to generate an effective memory tip for an English word.

Technique families:
1. **Association**: link the word to images, sounds, or meaning
2. **Word roots**: use roots, prefixes, and suffixes
3. **Scene-based memory**: place the word in a vivid situation
4. **Story method**: connect the word to a short narrative
5. **Mnemonic method**: use acronyms, rhythm, or memorable cues

Requirements:
1. The technique must be easy to use.
2. It should be scientifically sensible and memorable.
3. Make it vivid and engaging.
4. Include an estimated time to learn it.

Return JSON only.`;
  }

  /**
   * 获取释义系统提示词
   */
  private getExplanationSystemPrompt(): string {
    return `You are an English lexicography expert who writes learner-friendly definitions at multiple difficulty levels.

Your task is to generate explanation content that matches the learner's vocabulary level.

Difficulty levels:
1. **beginner**: very simple English
2. **intermediate**: clear English with moderate detail
3. **advanced**: fuller English explanations with richer vocabulary

Requirements:
1. Definitions must be accurate and clear.
2. Synonyms should be natural and common.
3. Collocations should be practical and high-frequency.
4. The output must match the target difficulty.

Return JSON only.`;
  }

  /**
   * 解析例句响应
   */
  private parseExample(content: string, style: 'visual' | 'linguistic' | 'contextual'): GeneratedExample {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentence: parsed.sentence || '',
          translation: parsed.translation || '',
          scenario: parsed.scenario || '',
          difficulty: parsed.difficulty || 'intermediate',
          style: style
        };
      }
    } catch (error) {
      console.error('Failed to parse example sentence:', error);
    }

    // 返回默认值
    return {
      sentence: `This is an example sentence with ${content}.`,
      translation: 'This is an example sentence.',
      scenario: 'General use case',
      difficulty: 'intermediate',
      style
    };
  }

  /**
   * 解析记忆技巧响应
   */
  private parseMemoryTip(content: string): GeneratedMemoryTip {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          technique: parsed.technique || 'association',
          title: parsed.title || 'Memory tip',
          content: parsed.content || '',
          effectiveness: parsed.effectiveness || 0.7,
          estimatedTime: parsed.estimatedTime || 5
        };
      }
    } catch (error) {
      console.error('Failed to parse memory tip:', error);
    }

    // 返回默认值
    return {
      technique: 'association',
      title: 'Association method',
      content: 'Remember this word by connecting it to a related image or scene.',
      effectiveness: 0.6,
      estimatedTime: 5
    };
  }

  /**
   * 解析释义响应
   */
  private parseExplanation(content: string): GeneratedExplanation {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          definition: parsed.definition || '',
          difficulty: parsed.difficulty || 'intermediate',
          synonyms: parsed.synonyms || [],
          antonyms: parsed.antonyms || [],
          collocations: parsed.collocations || []
        };
      }
    } catch (error) {
      console.error('Failed to parse explanation:', error);
    }

    // 返回默认值
    return {
      definition: 'Word definition',
      difficulty: 'intermediate',
      synonyms: [],
      antonyms: [],
      collocations: []
    };
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(contentType: string, wordId: string, word: string): string {
    return `${contentType}_${wordId}_${word}`;
  }

  /**
   * 更新状态
   */
  private updateState(generationTime: number): void {
    this.state.totalGenerated++;
    this.state.lastGeneratedAt = Date.now();

    // 更新平均生成时间
    const currentAvg = this.state.averageGenerationTime;
    this.state.averageGenerationTime = (currentAvg * (this.state.totalGenerated - 1) + generationTime) / this.state.totalGenerated;

    // 清理过期缓存
    if (this.config.cacheEnabled) {
      this.cleanupCache();
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const ttl = this.config.cacheTTL * 1000;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitCount: number } {
    let hitCount = 0;
    for (const item of this.cache.values()) {
      hitCount += item.hitCount;
    }
    return {
      size: this.cache.size,
      hitCount
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取生成器状态
   */
  getState(): ContentGeneratorState {
    return { ...this.state };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ContentGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): ContentGeneratorConfig {
    return { ...this.config };
  }
}

// 导出单例
export const personalizedContentGenerator = new PersonalizedContentGenerator();
