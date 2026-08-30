# LiveSuggest

LiveSuggest is a real-time, context-aware audio transcription and AI suggestion dashboard. It captures continuous audio, transcribes it, and feeds the context into language models (powered by Groq) to instantly generate conversational insights, fact-checks, and talking points. It also features a fully integrated Chat Window for manual deep dives into the transcribed context.

Visitors don't need a Groq API key of their own — every request is proxied through serverless functions that hold the key server-side, so only whoever deploys the app configures it.

##  Features

- **Live Audio Transcription:** Continuous batching and chunking of microphone input into readable transcripts.
- **Dynamic AI Suggestions:** Real-time generation of actionable cards (Fact Checks, Clarifying Info, Questions, Talking Points) based on the ongoing conversation.
- **Context-Aware Chat:** A conversational sandbox where you can query the AI about anything that was just spoken.
- **No API key required for users:** All Groq calls are proxied through server-side functions (`/api/*`) that hold the key in an environment variable — it's never shipped to the browser.
- **Deep Customization (Settings Modal):**
  - Pick the Groq model ID to use.
  - Tweak live suggestion generation prompts and chat system prompts.
  - Adjust hyper-parameters like Context Window size, Max Tokens, Temperature, and audio chunk interval.
- **Export Functionality:** One-click export of your full session (transcripts, suggestions, and chat history) to JSON for evaluation and review.

##  Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Vercel Edge Functions (`/api`) proxying to Groq, keeping the API key server-side
- **AI Inference Engine:** Groq API (Compatible with `openai/gpt-oss-120b`,`Whisper LargeV3` )
- **Icons & Markdown:** `lucide-react` & `react-markdown`

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- The [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) — used locally to run the API routes alongside the frontend.
- A free API key from [Groq Console](https://console.groq.com/keys) (only the deployer needs this).

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

3. **Configure your Groq API key locally:**
   ```bash
   cp .env.example .env
   # then edit .env and set GROQ_API_KEY=gsk_...
   ```

4. **Start the dev server (frontend + API routes):**
   ```bash
   vercel dev
   ```
   (Plain `npm run dev` / `vite` only serves the frontend — the `/api` routes won't respond, since those are Vercel serverless functions.)

5. **Open in browser:**
   Navigate to the URL `vercel dev` prints (defaults to `http://localhost:3000`).

### Deploying

When deploying on Vercel, set `GROQ_API_KEY` as an environment variable in the project settings (Project → Settings → Environment Variables) instead of committing it. It stays server-side and is never exposed to visitors.

##  Configuration & Prompts

All parameters and AI configurations are adjustable directly through the UI via the **Options & Tweaks** modal:
- **System Prompts:** You can modify the underlying system prompts that drive Live Suggestions, Standard Chat, and On-click Expanded Answers.
- **Context & Rules:** Choose the Groq model, set the audio chunk interval, define how many transcription chunks are sent to the AI, and control temperature/token generation directly from the interface.

