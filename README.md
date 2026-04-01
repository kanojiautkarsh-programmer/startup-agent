# Startup Agent

The AI That Never Forgets Your Startup.

## Features

- 🧠 **Persistent Memory** - Your startup's history stored forever
- 💬 **Contextual AI Chat** - Chat with AI that knows your context
- 🎯 **Accountability** - Never miss a deadline or commitment
- ⚡ **Fast & Minimal** - Clean, modern interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (customized)
- **Database**: Supabase
- **Auth**: Supabase Auth
- **AI**: Claude/Gemini/OpenAI (BYOK model)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Set up Supabase database:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema in `supabase/schema.sql` in the Supabase SQL Editor
   - Enable Email auth in Supabase Dashboard > Authentication > Providers
   - Add Google OAuth provider if desired
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Deploy

## Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Enable Email provider in Authentication > Providers
- [ ] Configure Google OAuth (optional):
  - Enable Google provider
  - Add Google OAuth credentials from Google Cloud Console
  - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
- [ ] Update `.env.local` with your credentials

## AI Setup

Users can configure their own API keys in Settings > API Keys:
- Anthropic (Claude)
- OpenAI (GPT-4)
- Google (Gemini)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard
│   ├── chat/              # Chat interface
│   ├── memory/            # Memory & context
│   ├── goals/            # Goal tracking
│   ├── settings/         # Settings pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── pricing/          # Pricing page
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── command/          # Command palette
├── lib/
│   ├── ai/               # AI integration
│   ├── supabase/         # Supabase clients
│   └── types/            # TypeScript types
└── supabase/
    └── schema.sql        # Database schema
```

## License

MIT
