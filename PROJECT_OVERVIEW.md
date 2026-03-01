# BrizAi - Personal AI Health & Productivity Application
## Project Overview & AI Handoff Document

**Version:** 1.0.0
**Last Updated:** November 2025

---

### 1. Project Purpose & Scope
**BrizAi** is a comprehensive, scientifically-grounded personal health and productivity dashboard. It is designed to track daily metrics (water, sleep, nutrition, fitness, activity) and provide actionable, AI-driven insights.

**Key Philosophy:**
- **Scientific Rigor:** Metrics like the "Daily Health Score" are calculated based on medical guidelines (CDC, WHO, National Sleep Foundation), not arbitrary numbers.
- **AI Integration:** The app uses LLMs (Gemini/Ollama) to analyze user data and provide detailed, research-backed advice (e.g., nutrient breakdowns, biomechanical feedback).
- **Aesthetics:** A premium, "Neon/Dark Mode" aesthetic using Tailwind CSS to ensure high user engagement.
- **Privacy:** All data is currently persisted locally via `localStorage`.

---

### 2. Technology Stack
- **Frontend Framework:** React (Vite)
- **Styling:** Tailwind CSS (Custom "Neon" configuration)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Handling:** date-fns
- **State Management:** React Context API (`AppContext`)
- **AI Integration:** Custom `aiService` connecting to Gemini API or local Ollama instance.

---

### 3. Directory Structure & File Descriptions

```text
c:/Ansh/BrizAi/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx       # Main landing view. Calculates & displays the "Daily Health Score".
│   │   ├── Features/
│   │   │   ├── ActivityLog.jsx     # Time-tracking & productivity log.
│   │   │   ├── CalendarView.jsx    # Split-view calendar (Todos vs Schedule). Context-aware forms.
│   │   │   ├── FitnessTracker.jsx  # Workout logger with METs-based calorie estimation.
│   │   │   ├── HealthChat.jsx      # Direct chat interface with the AI health assistant.
│   │   │   ├── NutritionTracker.jsx# Meal logger with AI nutrient analysis.
│   │   │   ├── Settings.jsx        # User profile (height/weight) & AI API configuration.
│   │   │   ├── SleepTracker.jsx    # Sleep duration/quality logger.
│   │   │   └── WaterTracker.jsx    # Hydration tracker with "Stanley Cup" units.
│   │   └── Layout/
│   │       ├── MainLayout.jsx      # App wrapper (Sidebar + Content Area).
│   │       └── Sidebar.jsx         # Navigation menu.
│   ├── context/
│   │   └── AppContext.jsx          # GLOBAL STATE. Handles user profile, logs, tasks, and localStorage persistence.
│   ├── services/
│   │   └── aiService.js            # AI LOGIC. Handles API calls to Gemini/Ollama and prompt engineering.
│   ├── App.jsx                     # Main router/component switcher.
│   └── index.css                   # Global styles & Tailwind directives.
├── tailwind.config.js              # Custom color palette (neon-blue, accent-primary) & animations.
└── package.json                    # Dependencies.
```

---

### 4. Core Logic & Algorithms (CRITICAL FOR AI)

#### A. Daily Health Score (`Dashboard.jsx`)
The Health Score (0-100) is **strictly calculated** using the following weighted formula:

1.  **Hydration (30 pts):**
    *   *Goal:* `Weight (kg) * 35ml`.
    *   *Score:* `(Current / Goal) * 30`. Capped at 30.
2.  **Sleep (30 pts):**
    *   *Optimal (7-9h):* 30 pts.
    *   *Okay (6-7h or 9-10h):* 20 pts.
    *   *Poor (<6h or >10h):* 10 pts.
3.  **Activity (20 pts):**
    *   *Goal:* 10,000 steps (proxy).
    *   *Score:* `(Steps / 10000) * 20`. Capped at 20.
4.  **Nutrition/Consistency (20 pts):**
    *   *Proxy:* Number of logged meals.
    *   *Score:* `(Meals Logged / 3) * 20`. Capped at 20.

#### B. Calendar Logic (`CalendarView.jsx`)
*   **Split Sidebar:** The sidebar is physically divided into two distinct cards:
    *   **Top:** "Todos" (Simple tasks, no time/location).
    *   **Bottom:** "Schedule" (Calendar events with time/location).
*   **Context-Aware Addition:**
    *   Clicking "Add Todo" opens a simple text input.
    *   Clicking "Add Event" opens a detailed form (Time, Location, Color).
*   **Data Structure:** Both are stored in the `tasks` array in `AppContext`, differentiated by the `isTodo` boolean flag.

#### C. AI Service (`aiService.js`)
*   **Prompt Engineering:** The `analyzeSection` function injects specific instructions:
    *   *Nutrition:* Must list Vitamins, Minerals, and Roughage.
    *   *Fitness:* Must validate metrics using biomechanics/METs.
    *   *Tone:* "Advanced personal health assistant."
*   **Model Support:** Supports both Google Gemini (API Key required) and Ollama (Local URL).

#### D. Fitness Metrics (`FitnessTracker.jsx`)
*   **Calories:** Estimated using METs (Metabolic Equivalent of Task) values hardcoded for common exercises (e.g., Bench Press = 6.0 METs).
*   **Formula:** `Duration (mins) * (METs * 3.5 * Weight(kg)) / 200`.

---

### 5. Future Development Guidelines
If you are an AI agent picking up this project:

1.  **Maintain Scientific Accuracy:** Do not invent metrics. Always try to ground new features in medical literature (cite sources in comments or UI).
2.  **Preserve the Aesthetic:** New components must use the existing `card`, `input-field`, and `btn-primary` classes to match the neon/glassmorphism look.
3.  **Context First:** Always check `AppContext.jsx` to see what data is available before creating new state.
4.  **No "View Modes" in Calendar:** The user explicitly rejected toggle buttons. Keep the split view.
