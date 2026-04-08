# Muse - AI-Powered English Vocabulary Learning Assistant

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>An AI-driven intelligent English vocabulary learning assistant</strong>
</p>

<p align="center">
  Combining advanced AI technology with proven learning methods for smarter vocabulary learning
</p>

<p align="center">
  <a href="./README.md">Project README</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#ai-configuration">AI Configuration</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Version-1.6.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License">
</p>

<p align="center">
  This project is accelerated, computed and protected by Alibaba Cloud ESA
  <br>
  <img src="AlibabaESA.png" alt="Alibaba ESA" width="600">
</p>

---

## 📖 Introduction

**Muse** is an AI-driven intelligent English vocabulary learning assistant built with Electron + React + TypeScript. It combines cutting-edge AI technology with scientific memory algorithms to provide a personalized learning experience.

### Core Features

- 🧠 **AI Study Plan Generator** - Automatically creates personalized study plans based on your goals and level
- 📚 **Scientific Memory Algorithm** - Spaced repetition system based on SM-2 Ebbinghaus forgetting curve
- 🤖 **AI Deep Analysis** - Provides definitions, contextual examples, and memory techniques
- 🎯 **Smart Quiz System** - AI generates dynamic questions adapted to your vocabulary level
- 🎮 **Game Center** - Learn through play with letter connection games and save discovered words
- 📊 **Visual Statistics** - Track progress, accuracy, and memory curves at a glance
- ⌨️ **Full Keyboard Support** - Efficient keyboard shortcuts for productive learning
- 🔄 **Auto Update Check** - Automatically checks for updates on startup

## ✨ Features

### 📚 Learning Features

| Feature | Description |
|---------|-------------|
| **Flashcard Learning** | Interactive flip-card experience with phonetics, definitions, and examples |
| **Smart Review** | SM-2 algorithm based reviews only when words are about to be forgotten |
| **Quick Review** | Review all learned words at once, regardless of algorithm |
| **Vocabulary Quizzes** | Multiple choice and spelling quiz modes |
| **AI Quizzes** | AI generates questions based on your vocabulary with adaptive difficulty |
| **Daily Review** | Sidebar shows all words learned today, supports cross-session viewing |

### 🤖 AI-Powered Features

| Feature | Description |
|---------|-------------|
| **AI Study Plan** | Analyzes your level and goals, automatically generates personalized study plans |
| **AI Deep Analysis** | Manual trigger for etymology, usage notes, confusing words, and more |
| **AI Learning Coach** | Provides personalized learning suggestions and progress analysis |
| **AI Word Generation** | Generate words by topic and batch import to vocabulary books |
| **Smart Data Enrichment** | Automatically detects and fills in missing word information |

### 🎯 Supported AI Services

| Provider | Models | API Key |
|----------|--------|---------|
| **OpenAI** | GPT-4o, GPT-4o-mini, Qwen, DeepSeek, Zhipu AI, etc. | ✅ Required |
| **Claude** | Claude 3.5 Sonnet, Haiku, etc. | ✅ Required |
| **Gemini** | Gemini 1.5 Pro, Flash, etc. | ✅ Required |
| **Ollama** | Llama3, Mistral, and other open-source models | ❌ Not required (local) |
| **Custom** | Any OpenAI-compatible API | Varies |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Freakz3z/Muse.git

# Navigate to directory
cd Muse

# Install dependencies
npm install
```

### Development Mode

```bash
npm run electron:dev
```

### Build Application

```bash
# Web version
npm run build:web

# Electron desktop version
npm run electron:build
```

Build artifacts will be in the `release` directory.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Electron 28 |
| **UI Library** | React 18 |
| **Language** | TypeScript 5.3 |
| **Build Tool** | Vite 5.0 |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **Storage** | LocalForage (IndexedDB) |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |

## 📁 Project Structure

```
Muse/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   └── preload.ts        # Preload script
├── src/
│   ├── components/       # Common components
│   │   ├── ProgressBar.tsx      # Progress bar component
│   │   ├── WordCard.tsx         # Flashcard component
│   │   ├── AIAssistant.tsx      # AI assistant component
│   │   └── StudyPlanModal.tsx   # Study plan modal
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Homepage
│   │   ├── Learn.tsx     # Learning page
│   │   ├── Review.tsx    # Review page
│   │   ├── Quiz.tsx      # Quiz page
│   │   ├── AIQuiz.tsx    # AI quiz page
│   │   ├── AICoach.tsx   # AI coach page
│   │   ├── WordBook.tsx  # Vocabulary book management
│   │   ├── Statistics.tsx # Statistics page
│   │   ├── Settings.tsx  # Settings page
│   │   ├── About.tsx     # About page
│   │   └── SearchPage.tsx # Word search page
│   ├── services/
│   │   ├── ai/           # AI services
│   │   │   ├── index.ts  # AI service core
│   │   │   └── types.ts  # AI type definitions
│   │   └── dictionary/   # Dictionary API service
│   ├── store/            # Zustand state management
│   ├── storage/          # IndexedDB data storage
│   ├── hooks/            # Custom hooks
│   │   └── useShortcuts.ts  # Shortcut management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── spaced-repetition.ts  # SM-2 algorithm
│   └── data/             # Built-in data
└── package.json
```

## 🎯 Core Algorithms

### SM-2 Spaced Repetition Algorithm

Muse uses the classic SM-2 algorithm to optimize review timing:

- **Ease Factor (EF)**: 1.3 - 2.5, dynamically adjusted based on response quality
- **Interval (I)**: Days between reviews
- **Next Review Time**: Calculated based on current interval and ease factor

### Four-Level Rating System

| Rating | Meaning | Quality |
|--------|---------|---------|
| Too Easy | Fully mastered | 5 |
| Remembered | Basically mastered | 4 |
| A Bit Hard | Somewhat fuzzy | 3 |
| Forgot | Completely forgotten | 1 |

## 🤖 AI Configuration

### Using OpenAI / Claude / Gemini

1. Go to **Settings** → **AI Services**
2. Select service provider
3. Enter API Key
4. Click **Test & Save**

### Using Ollama (Free, Local)

1. Install [Ollama](https://ollama.ai/)
2. Download model: `ollama pull llama3`
3. Select **Ollama** in settings
4. Default URL: `http://localhost:11434`
5. No API Key needed, just click test!

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl + Shift + M` | Show/Hide main window |
| `Alt + X` | Show/Hide floating word lookup window (customizable) |

### Learning Interface (Customizable)

| Shortcut | Function | Notes |
|----------|----------|-------|
| `Space` | Show answer / Return to current | Returns in history mode |
| `D` | Know / Next | Next word in history mode |
| `A` | Don't know / Previous | Previous word in history mode |
| `W` | AI Deep Analysis | AI required |
| `R` | Play pronunciation | - |

### Review Interface (Customizable)

| Shortcut | Function |
|----------|----------|
| `1` | Too Easy |
| `2` | Remembered |
| `3` | A Bit Hard |
| `4` | Forgot |

> 💡 All shortcuts can be customized in settings!

## 🎨 UI Features

- 🎨 Modern card-based design
- ✨ Smooth flip animations
- 🌈 Gradient color themes
- 💜 Purple color scheme for AI features
- 📱 Responsive layout
- 🎯 Unified learning/review interface style
- 🪟 Floating Word Lookup Window - Quick word lookup, add anytime
- 📋 Beautiful changelog display

## 📊 Data Storage

- **Local Storage**: Uses IndexedDB, all data stored locally
- **Data Safety**: Supports JSON export/import for vocabulary books
- **Privacy**: No internet required for basic features (AI features excluded)

## 🐛 Known Issues

- Web version doesn't support system tray and global shortcuts
- Slow initial load time (being optimized)

## 📝 Roadmap

- [ ] Cloud data synchronization
- [ ] More vocabulary books
- [ ] Learning community features
- [ ] Voice recognition practice
- [ ] Mobile adaptation

## 🤝 Contributing

Contributions welcome! Please submit Pull Requests or issues.

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the [Apache 2.0](LICENSE) License.

## 🙏 Acknowledgments

- Thanks to all contributors
- Thanks to the open source community
- Thanks to Alibaba ESA for acceleration services

---

<p align="center">
  Made with ❤️ for English learners
</p>

<p align="center">
  <!-- Share Badge -->
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20Muse%20-%20An%20AI-powered%20English%20vocabulary%20learning%20assistant%20%F0%9F%9A%80&url=https%3A%2F%2Fgithub.com%2FFreakz3z%2FMuse&hashtags=Muse,EnglishLearning,AI,Vocabulary">
    <img src="https://img.shields.io/badge/Share-%23Twitter-blue?style=for-the-badge&logo=twitter" alt="Share on Twitter">
  </a>
</p>

<p align="center">
  <!-- Star History -->
  <a href="https://star-history.com/#Freakz3z/Muse&Date">
    <img src="https://api.star-history.com/svg?repos=Freakz3z/Muse&type=Date" alt="Star History Chart">
  </a>
</p>
