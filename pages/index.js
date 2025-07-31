import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Initialise Supabase client outside of the component to avoid re-instantiating
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState(7);
  const [preferences, setPreferences] = useState('');
  const [budget, setBudget] = useState('mid-range');
  const [pace, setPace] = useState('medium');

  // Itinerary state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState('');
  const [shareLink, setShareLink] = useState('');

  // Fetch existing itinerary when arriving with an id parameter
  useEffect(() => {
    async function fetchItinerary() {
      if (id && typeof id === 'string') {
        try {
          const { data, error } = await supabase
            .from('itineraries')
            .select('itinerary')
            .eq('id', id)
            .single();
          if (error) {
            setError('Failed to fetch itinerary');
          } else if (data) {
            setItinerary(data.itinerary);
            setShareLink(window.location.href);
          }
        } catch (err) {
          setError('Unexpected error retrieving itinerary');
        }
      }
    }
    fetchItinerary();
  }, [id]);

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setItinerary('');
  setShareLink('');

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, tripLength, preferences, budget, pace })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate itinerary');
    }
    setItinerary(data.itinerary);
    if (data.id) {
      const link = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
      setShareLink(link);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>AI Itinerary Builder 3</h1>
      <p>Generate custom travel itineraries powered by AI. Fill out the form below and click Generate.</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Destination:{' '}
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              style={{ padding: '0.25rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Trip Length (days):{' '}
            <input
              type="number"
              min="1"
              value={tripLength}
              onChange={(e) => setTripLength(parseInt(e.target.value))}
              style={{ padding: '0.25rem', width: '4rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Preferences (e.g. nature, cities, food):{' '}
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              style={{ padding: '0.25rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Budget:{' '}
            <select value={budget} onChange={(e) => setBudget(e.target.value)} style={{ padding: '0.25rem' }}>
              <option value="economy">Economy</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Pace:{' '}
            <select value={pace} onChange={(e) => setPace(e.target.value)} style={{ padding: '0.25rem' }}>
              <option value="relaxed">Relaxed</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Generating…' : 'Generate Itinerary'}
        </button>
      </form>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      {itinerary && (
        <div style={{ marginBottom: '1rem' }}>
          <h2>Your Itinerary</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem' }}>{itinerary}</pre>
        </div>
      )}
      {shareLink && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Shareable Link: </strong>
          <a href={shareLink}>{shareLink}</a>
        </div>
      )}
      {!itinerary && !loading && id && (
        <div style={{ marginBottom: '1rem' }}>
          <em>Loading itinerary…</em>
        </div>
      )}
    </div>
  );
}
