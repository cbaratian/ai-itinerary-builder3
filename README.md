# AI Itinerary Builder 3

AI Itinerary Builder 3 is a Next.js application that showcases how to build and share travel itineraries using generative AI.  
Users can describe a trip (destination, duration, preferences, budget and pace) and the site will request a day‑by‑day itinerary from the OpenAI API.  
The generated itinerary is cached in a Supabase table so repeat requests for the same trip return instantly without additional API calls.  
Each generated itinerary has a unique ID which can be shared via a link; visiting the link fetches the itinerary directly from Supabase.

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` – runs development server
- `npm run build` – builds for production
- `npm start` – runs built project

## Placeholder Environment Variables

This project uses placeholder environment variables for future integrations:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_SOCKET_SERVER_URL`
- `OPENAI_API_KEY`

Set these variables in your deployment platform (e.g., Vercel) to use real services.

## Supabase Setup

To enable caching and shareable links, create a table called `itineraries` in your Supabase project with the following schema:

| column | type    | description                               |
|-------:|:--------|:------------------------------------------|
| `id`   | `uuid`  | primary key (default: `gen_random_uuid()`)|
| `hash` | `text`  | hash of the itinerary prompt               |
| `itinerary` | `text` | raw itinerary text returned from OpenAI |

Enable Row Level Security (RLS) on the table and create policies to allow anonymous reads and writes if you intend to use the public anon key from the client.  
For production use you should add appropriate access controls to prevent abuse.
