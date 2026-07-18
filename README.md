# Flam-Assist — AI Study Assistant

A study assistant built for the Frontend Internship Assignment. Paste in notes or a topic, and the app turns them into interactive flashcards and a quiz — no chatbot, just structured, stateful UI generated from the model's output.

**Live demo:** [flam.iankushsingh.in](https://flam.iankushsingh.in)
**Demo video:** [Watch here](https://drive.google.com/file/d/1pzoITndC12yejpynRR7-YZ1bH4We9cVQ/view?usp=sharing)

## Features

- Free-form text input for notes or a topic
- AI-generated flashcards you can flip through
- AI-generated quiz with scoring and the ability to re-test on wrong answers
- Structured JSON output parsed into interactive React components (no raw model text dumped to the screen)
- Loading, error, and empty states
- Graceful handling of malformed/slow/failed model responses, with retry
- Responsive layout, works on mobile

## Tech Stack

- **Frontend:** React (hooks, functional components), TypeScript, Vite
- **Backend:** Supabase (serverless functions to keep the API key off the client)
- **AI Provider:** Groq
- **Deployment:** Vercel

## Setup

1. Clone the repo
   ```bash
   git clone https://github.com/iankushsingh/flam-assist.git
   cd flam-assist
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Add environment variables — create a `.env` file with your Groq API key and Supabase project credentials:
   ```
   GROQ_API_KEY=your_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_PROJECT_ID=your_id_here
   SUPABASE_PUBLISHABLE_KEY=your_key_here
   VITE_SUPABASE_PROJECT_ID=your_id_here
   VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
   VITE_SUPABASE_URL=your_url_here
   ```
4. Run locally
   ```bash
   npm start
   ```

## AI Usage Note

Groq was used as the LLM provider to generate flashcards and quiz content from the user's input, called through a Supabase serverless function so the API key is never exposed in the browser. AI coding assistants (Claude/ChatGPT/Copilot-style tools) were used during development to speed up boilerplate and debug issues — all code was reviewed and understood before committing.

## Known Limitations

- Not yet tested extensively across all edge cases of malformed model output
- No persistence — sessions aren't saved/reloaded between visits
- No streaming of results as they generate

## Time Spent

~9 hours (slightly over the suggested 8-hour target).
