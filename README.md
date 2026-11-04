# Chirp

A small Twitter-style social feed built with Next.js (App Router) and React.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Features

- Home feed with "For you" and "Following" tabs
- Posting with a 280-character limit
- Threaded replies
- Likes and reposts
- Deleting your own posts, which also removes their replies
- Profiles with Posts, Replies and Likes tabs
- Following and unfollowing
- Notifications
- Search, trending hashtags and follow suggestions
- Light and dark themes, plus a phone layout

## How it works

- `app/`: pages, plus the Server Actions for every change (`app/actions.ts`)
- `components/`: UI components
- `lib/db.ts`: JSON file storage, seeded with sample data on first run
- `lib/queries.ts`: reads that shape the data for each page

## Limitations

This is a local demo, not something to deploy as is:

- **No real login.** The account menu in the sidebar switches between the sample
  users with no password.
- **Single-server storage.** Data lives in `data/db.json`, which isn't committed.
  Delete that file to reset to the sample data.
