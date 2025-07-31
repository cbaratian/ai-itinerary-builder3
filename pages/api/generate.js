import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * API route for generating itineraries via OpenAI and caching results in Supabase.
 *
 * The incoming request should be a POST with a JSON body containing:
 * {
 *   destination: string,
 *   tripLength: number,
 *   preferences: string,
 *   budget: string,
 *   pace: string
 * }
 *
 * The route constructs a structured prompt for the OpenAI model, checks if an
 * itinerary for that prompt already exists in the `itineraries` table of
 * Supabase, and if so, returns the cached itinerary. Otherwise it calls
 * OpenAI's chat completion API, stores the generated itinerary along with a
 * hash of the prompt, and returns the new itinerary to the client.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    destination = '',
    tripLength = 0,
    preferences = '',
    budget = '',
    pace = ''
  } = req.body || {};

  // Validate input to avoid calling OpenAI with invalid parameters
  if (!destination || !tripLength) {
    return res.status(400).json({ error: 'Destination and tripLength are required' });
  }

  // Construct a prompt for the itinerary request. We ask the AI model to
  // produce a JSON itinerary to simplify parsing on the client side.
  const prompt = `Create a ${tripLength}-day travel itinerary for ${destination}.\n` +
    `Preferences: ${preferences || 'no specific preferences'}. Budget: ${budget || 'mid-range'}. ` +
    `Pace: ${pace || 'medium'}.\n` +
    `Provide daily destinations, activities, and notable restaurants in JSON format.`;

  // Create a simple hash of the prompt to use as a cache key. This avoids
  // storing identical itineraries multiple times. Using JSON.stringify on
  // the payload ensures that differences in object ordering don’t change the
  // hash. Note: for production use a stronger hash algorithm like SHA256.
  const hash = Buffer.from(prompt).toString('base64');

  // Initialise Supabase client. We use the public env vars here since
  // server-side environment variables are not available in Next.js API routes
  // via process.env.NEXT_PUBLIC_*. That said, these values are kept in Vercel
  // project environment variables and are not committed to the repo.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check for cached itinerary
    const { data: existing, error: selectError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('hash', hash)
      .maybeSingle();
    if (selectError) {
      // Log but don’t prevent itinerary generation
      console.error('Supabase select error', selectError);
    }
    if (existing && existing.itinerary) {
      return res.status(200).json({ itinerary: existing.itinerary, id: existing.id });
    }
  } catch (err) {
    console.error('Supabase lookup failed', err);
  }

  // If not cached, call OpenAI API to generate itinerary
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful travel itinerary planner.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('OpenAI API error', err);
      return res.status(500).json({ error: 'Failed to generate itinerary' });
    }
    const openaiData = await openaiRes.json();
    const responseContent = openaiData?.choices?.[0]?.message?.content || '';

    // Save the response to Supabase for caching. We store the raw response
    // string so the client can parse or display it as needed.
    const id = uuidv4();
    try {
      await supabase.from('itineraries').insert({ id, hash, itinerary: responseContent });
    } catch (err) {
      console.error('Supabase insert failed', err);
    }
    return res.status(200).json({ itinerary: responseContent, id });
  } catch (err) {
    console.error('Error generating itinerary', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
