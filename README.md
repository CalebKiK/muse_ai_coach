# Muse - AI-Powered English Vocabulary Learning Assistant

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>An AI-driven English vocabulary learning assistant</strong>
</p>

<p align="center">
  Combining modern AI workflows with evidence-based study methods for smarter vocabulary learning
</p>

<p align="center">
  <a href="./README_EN.md">Alternate README</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#ai-configuration">AI Configuration</a> •
  <a href="#keyboard-shortcuts">Keyboard Shortcuts</a>
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
  This project is accelerated, computed, and protected by Alibaba Cloud ESA
  <br>
  <img src="AlibabaESA.png" alt="Alibaba ESA" width="600">
</p>

---

## 📖 Introduction

**Muse** is an Electron + React + TypeScript desktop app for English vocabulary learning. It combines AI-assisted workflows with structured review systems and vocabulary tools.

### Core Highlights

- 🧠 **AI study planning** for personalized learning paths
- 📚 **Spaced repetition reviews** based on SM-2 principles
- 🤖 **AI word analysis** for definitions, examples, and memory hooks
- 🎯 **Quiz and challenge modes** driven by your vocabulary level
- 🎮 **Word games** including letter-link gameplay
- 📊 **Progress tracking** with review and study statistics
- ⌨️ **Keyboard shortcuts** for fast learning workflows
- 🔄 **Update checks** built into the desktop app

## ✨ Features

### 📚 Learning

| Feature | Description |
|------|------|
| **Flashcard learning** | Flip-card study with phonetics, meanings, and examples |
| **Smart review** | Review words when they are due instead of brute-force repetition |
| **Quick review** | Revisit learned words on demand |
| **Vocabulary quizzes** | Practice with multiple quiz modes |
| **AI quizzes** | Generate adaptive questions from your word set |
| **Today view** | See what you learned today across sessions |

### 🤖 AI Features

| Feature | Description |
|------|------|
| **AI study plans** | Generate plans from level and goals |
| **AI analysis** | Expand meanings, usage, and related context |
| **AI coach** | Offer study suggestions and performance insights |
| **AI word generation** | Create topical word sets for import |
| **Data enrichment** | Fill in missing word details automatically |

### 🎯 Supported AI Providers

| Provider | Models | API Key |
|--------|---------|---------|
| **OpenAI** | GPT-4o, GPT-4o-mini, and compatible APIs | Required |
| **Claude** | Claude family models | Required |
| **Gemini** | Gemini family models | Required |
| **Ollama** | Local open-source models | Not required |
| **Custom** | Any OpenAI-compatible API | Depends on provider |

## 🚀 Quick Start

### Requirements

- Node.js 20+
- npm

### Install

```bash
# Clone the repo
git clone https://github.com/Freakz3z/Muse.git

# Enter the project
cd muse_ai_coach

# Install dependencies
npm install
```

### Development

```bash
npm run electron:dev
```

### Build

```bash
# Web build
npm run build:web

# Electron desktop build
npm run electron:build
```

Artifacts are generated in `release/`.

## 🛠️ Tech Stack

| Category | Technology |
|------|------|
| **Desktop shell** | Electron |
| **UI** | React |
| **Language** | TypeScript |
| **Build tool** | Vite |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Storage** | LocalForage / IndexedDB |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |

## 🤖 AI Configuration

### OpenAI / Claude / Gemini

1. Open **Settings** → **AI Services**
2. Choose a provider
3. Enter the API key
4. Click **Test & Save**

### Ollama

1. Install [Ollama](https://ollama.ai/)
2. Pull a model such as `ollama pull llama3`
3. Select **Ollama** in Settings
4. Use `http://localhost:11434`
5. Test the connection

## ⌨️ Keyboard Shortcuts

### Global

| Shortcut | Function |
|--------|------|
| `Ctrl + Shift + M` | Toggle the main window |
| `Alt + X` | Toggle the floating lookup window |

### Learning

| Shortcut | Function | Notes |
|--------|------|------|
| `Space` | Reveal answer / return | Returns in history mode |
| `D` | Know / next | Advances in history mode |
| `A` | Don’t know / previous | Moves backward in history mode |
| `W` | AI analysis | Requires AI setup |
| `R` | Play pronunciation | - |

### Review

| Shortcut | Function |
|--------|------|
| `2` | Remembered |
| `3` | A bit hard |
| `4` | Forgot |

All shortcuts can be customized in Settings.

## 🎨 UI Notes

- Modern card-based design
- Smooth flip animations
- Gradient-based visual language
- Responsive layouts
- Unified learning and review flows
- Floating lookup window for fast capture
- Built-in update messaging

## 📊 Data

- Local-first storage with IndexedDB
- JSON import/export for vocabulary data
- Core study features work offline

## 🤝 Contributing

Issues and pull requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch to your fork
5. Open a pull request

## 📄 License

This project is licensed under [Apache 2.0](LICENSE).

## 🙏 Acknowledgements

- Thanks to all contributors
- Thanks to the open-source community
- Thanks to Alibaba Cloud ESA for acceleration services

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
