# AI Itinerary Builder 3

AI Itinerary Builder 3 is a **full‑stack Next.js app** that helps travelers generate personalized day‑by‑day itineraries using generative AI.  
Users can enter a destination, trip length, budget, pace and preferences (e.g. nature, cities, food) and the app will call the OpenAI API to produce a bespoke travel plan.  
Itineraries are cached in Supabase so returning users with the same query get instant results without incurring additional API costs.  
Each itinerary has a unique link that can be shared or revisited later.

## Features

- **Modern UI** – Responsive layout with a colourful hero banner and card‑style form built using custom CSS and Google Fonts.
- **AI‑generated itineraries** – Integrates with OpenAI’s API to create daily schedules based on user inputs.
- **Caching with Supabase** – Saves generated itineraries to a Supabase table and returns cached results for repeat requests.
- **Shareable links** – Every itinerary has a unique ID; visiting `/` with `?id=<itinerary-id>` fetches the stored plan directly from Supabase.
- **Environment variables** – All secrets and API keys are managed through environment variables on Vercel (or a local `.env.local` file during development).

## Getting Started

### Deploy with Vercel

1. **Fork this repository** or clone it into your own GitHub account.  
2. In Vercel, import the project and set the following environment variables under **Project → Settings → Environment Variables**:

   | Key | Value |
   | --- | ----- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyzcompany.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
   | `OPENAI_API_KEY` | Your OpenAI API key |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional)* Google Maps API key for future map integration |
   | `NEXT_PUBLIC_SOCKET_SERVER_URL` | *(optional)* URL of your Socket.io server for real‑time collaboration |

3. Create a table in Supabase called **`itineraries`** with columns:

   | Column | Type | Notes |
   | --- | --- | --- |
   | `id` | `uuid` | Primary key |
   | `hash` | `text` | SHA‑1 hash of the user query used to identify duplicates |
   | `itinerary` | `text` | Full itinerary returned from OpenAI |

   Enable **Row Level Security** and allow `select` and `insert` on the table for the anon key.

4. Once the environment variables are set and the table is created, redeploy the project.  
   Your app will be available at `https://<your-project>.vercel.app`.

### Local Development

To run the project locally:

```bash
git clone https://github.com/your-username/ai-itinerary-builder3.git
cd ai-itinerary-builder3
npm install

# create a .env.local file at the project root with your keys
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key

npm run dev
```

Visit `http://localhost:3000` in your browser.  
You can generate itineraries locally as long as your API keys are valid.

## Future Enhancements

This starter includes the basic functionality for generating and sharing itineraries. Some ideas for future improvements include:

- Adding map integration (Google Maps or Mapbox) to display stops on an interactive map.
- Implementing user authentication so itineraries can be saved under a user account.
- Integrating real‑time collaboration with a Socket.io server so multiple users can edit an itinerary simultaneously.
- Allowing users to upload trip documents or photos and incorporate them into the itinerary.

Feel free to fork and extend this project to suit your needs!
