# PH High School Math Mock Exam

A 100-item, 3-hour timed mock exam covering Philippine K-12 high school mathematics (Grades 7–12). No calculus.

## Features

- **100 multiple-choice items** across number sense, algebra, geometry, trigonometry, statistics, and functions/sequences
- **3-hour countdown timer** with auto-submit when time expires
- **KaTeX** for beautiful math rendering
- **SVG & Matter.js visualizations** for geometry, graphs, and physics demos
- **Auto-save progress** to localStorage on every answer + Supabase cloud backup
- **Scoring & topic breakdown** with full answer review

## Setup

```bash
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
```

Run the SQL migration in `supabase/migrations/001_exam_sessions.sql` in your Supabase SQL editor.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

Without Supabase configured, the app still works — progress is saved to localStorage. With Supabase, sessions sync to the cloud so progress survives browser clears (as long as you have the session ID in localStorage, or resume from the same device).

## Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- KaTeX, Matter.js, Zustand
- Supabase
