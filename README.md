# LiveSuggest

LiveSuggest is a real-time, context-aware audio transcription and AI suggestion dashboard. It captures continuous audio, transcribes it, and feeds the context into language models (powered by Groq) to instantly generate conversational insights, fact-checks, and talking points. It also features a fully integrated Chat Window for manual deep dives into the transcribed context.

## 🚀 Features

- **Live Audio Transcription:** Continuous batching and chunking of microphone input into readable transcripts.
- **Dynamic AI Suggestions:** Real-time generation of actionable cards (Fact Checks, Clarifying Info, Questions, Talking Points) based on the ongoing conversation.
- **Context-Aware Chat:** A conversational sandbox where you can query the AI about anything that was just spoken.
- **Deep Customization (Settings Modal):**
  - Enter your own Groq API Key.
  - Tweak live suggestion generation prompts and chat system prompts.
  - Adjust hyper-parameters like Context Window size, Max Tokens, and Temperature.
- **Export Functionality:** One-click export of your full session (transcripts, suggestions, and chat history) to JSON for evaluation and review.

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **AI Inference Engine:** Groq API (Compatible with `openai/gpt-oss-120b`,`Whisper LargeV3` )
- **Icons & Markdown:** `lucide-react` & `react-markdown`

## 📦 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A free API key from [Groq Console](https://console.groq.com/keys).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd LiveSuggest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`.

5. **Configure API Key:**
   Click the gear icon (Settings) in the top right of the application and input your Groq API Key to enable transcription, suggestions, and chat capabilities.

## ⚙️ Configuration & Prompts

All parameters and AI configurations are adjustable directly through the UI via the **Options & Tweaks** modal:
- **API Key:** Set your Groq API key (persisted locally).
- **System Prompts:** You can modify the underlying system prompts that drive Live Suggestions, Standard Chat, and On-click Expanded Answers.
- **Context & Rules:** Define how many transcription chunks are sent to the AI, and control temperature/token generation directly from the interface.

## 🚀 Deployment

The easiest way to deploy this application is via [Vercel](https://vercel.com/):

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Vercel will automatically detect the Vite framework and handle the build steps (`npm run build`).
4. Click Deploy!
