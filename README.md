# 🏋️ BrizAi - AI-Powered Personal Health & Performance Coach

<div align="center">

![BrizAi Banner](https://img.shields.io/badge/BrizAi-Health%20Coach-00ff88?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat-square&logo=vite)
![Google Fit](https://img.shields.io/badge/Google%20Fit-Integrated-4285F4?style=flat-square&logo=google-fit)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Your Elite AI Personal Coach for Peak Performance**

*Data-driven insights • Personalized recommendations • Google Fit sync • Privacy-first*

</div>

---

## ✨ Features

### 🤖 AI Personal Coach
- **Elite coaching experience** powered by Google Gemini or local Ollama models
- **Data-driven insights** that correlate sleep, nutrition, fitness, and schedule
- **Persistent chat history** that survives page refreshes
- **Clean, readable responses** without markdown clutter
- **Multi-model support** - Switch between Gemini models or run locally with Ollama

### 📊 Comprehensive Dashboard
- **Real-time health metrics** - Steps, calories, sleep quality at a glance
- **Google Fit integration** - Automatic sync of fitness data
- **Visual progress tracking** with beautiful charts
- **Quick action buttons** for fast data entry

### 🏃 Fitness Tracking
- **Step counter** with daily goals
- **Calorie tracking** - Burned and consumed
- **Workout logging** with multiple exercise types
- **Weight tracking** with trend visualization
- **Google Fit sync** for automatic data import

### 😴 Sleep Tracker
- **Sleep duration** calculated or synced from Google Fit
- **Quality assessment** - Rate your sleep quality
- **Bedtime/wake time** logging
- **Sleep pattern insights** from AI coach

### 🍎 Nutrition Tracker
- **Meal logging** - Breakfast, lunch, dinner, snacks
- **Calorie estimation** with AI assistance
- **Hydration tracking** - Water intake goals
- **Nutritional insights** - Vitamins, minerals, fiber analysis

### 📅 Calendar & Tasks
- **Schedule management** with event creation
- **Todo lists** with completion tracking
- **Color-coded events** for easy visibility
- **AI-powered scheduling suggestions**

### ⚙️ Flexible Settings
- **Profile customization** - Age, weight, height, preferences
- **AI provider selection** - Gemini (cloud) or Ollama (local)
- **Model selection** - Choose from multiple AI models
- **Google Fit connection** - Easy OAuth setup
- **Privacy controls** - All data stored locally

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) Google Cloud project for Fit integration
- (Optional) Ollama for local AI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/brizai.git
cd brizai

# Install dependencies
npm install

# Start development server
npm run dev
```

### First-Time Setup

1. **Open the app** at `http://localhost:5173`
2. **Go to Settings** and configure:
   - Your profile information
   - AI provider (Gemini recommended for quick start)
   - Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
3. **Start chatting** with your AI coach!

---

## 🔧 Configuration

### AI Provider Setup

#### Option A: Google Gemini (Recommended)
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. In Settings, select "Gemini" as AI provider
3. Paste your API key
4. Select model (Flash Lite 2.0 recommended for best limits)

#### Option B: Ollama (Local, Free, Private)
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Start server: `ollama serve`
4. In Settings, select "Ollama"
5. Select your model from the dropdown

### Google Fit Integration

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Fitness API**
3. Configure OAuth consent screen:
   - Add test users (your email)
   - Add scopes for fitness data
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy Client ID to Settings in BrizAi
6. Click "Connect Google Fit"

---

## 🛡️ Privacy & Security

BrizAi is designed with **privacy-first** principles:

| Data | Storage | Security |
|------|---------|----------|
| Health logs | Browser localStorage | Never leaves your device |
| API keys | Browser localStorage | Direct API calls only |
| Chat history | Browser localStorage | Local persistence |
| Google Fit tokens | Browser localStorage | Auto-expires, can disconnect |

- ✅ **No backend servers** - All data stays local
- ✅ **No tracking** - Zero analytics or telemetry
- ✅ **Open source** - Fully auditable code
- ✅ **Ollama option** - Run AI completely offline

---

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **TailwindCSS** | Styling |
| **Recharts** | Data visualization |
| **Lucide React** | Icons |
| **Google Generative AI** | Gemini integration |
| **Google Fit API** | Fitness data sync |
| **Ollama** | Local LLM support |

---

## 📁 Project Structure

```
brizai/
├── src/
│   ├── components/
│   │   ├── Dashboard/       # Main dashboard view
│   │   ├── Features/        # Feature components
│   │   │   ├── FitnessTracker.jsx
│   │   │   ├── SleepTracker.jsx
│   │   │   ├── NutritionTracker.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── HealthChat.jsx
│   │   │   └── Settings.jsx
│   │   └── Layout/          # Navigation & layout
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── services/
│   │   ├── aiService.js     # AI integration (Gemini/Ollama)
│   │   └── googleFitService.js
│   ├── App.jsx
│   └── index.css
├── public/
├── vite.config.js
└── package.json
```



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
