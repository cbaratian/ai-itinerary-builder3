import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Initialise Supabase client outside of the component to avoid re-instantiating
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default function HomePage() {
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
    <>
      {/* Page metadata and font imports */}
      <Head>
        <title>AI Itinerary Builder</title>
        <meta name="description" content="Create personalized travel plans powered by AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="wrapper">
        <header className="hero">
          <h1>AI Itinerary Builder</h1>
          <p>Create personalized travel plans powered by AI.</p>
        </header>
        <main className="content">
          <form onSubmit={handleSubmit} className="form">
            <div>
              <label>Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Trip Length (days)</label>
              <input
                type="number"
                min="1"
                value={tripLength}
                onChange={(e) => setTripLength(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label>Preferences (e.g. nature, cities, food)</label>
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
            <div>
              <label>Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="economy">Economy</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label>Pace</label>
              <select value={pace} onChange={(e) => setPace(e.target.value)}>
                <option value="relaxed">Relaxed</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Generating…' : 'Generate Itinerary'}
            </button>
          </form>
          {error && <div className="error">Error: {error}</div>}
          {itinerary && (
            <div className="result">
              <h2>Your Itinerary</h2>
              <pre>{itinerary}</pre>
              {shareLink && (
                <p>
                  <strong>Shareable Link:&nbsp;</strong>
                  <a href={shareLink}>{shareLink}</a>
                </p>
              )}
            </div>
          )}
          {!itinerary && !loading && id && <div className="loading">Loading itinerary…</div>}
        </main>
      </div>
      {/* Global styles using styled-jsx */}
      <style jsx>{`
        .wrapper {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #f8f9fa;
        }
        .hero {
          background: linear-gradient(135deg, #4f9dff, #8faefc);
          color: #fff;
          padding: 3rem 1rem;
          text-align: center;
        }
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .hero p {
          font-size: 1.2rem;
        }
        .content {
          max-width: 800px;
          margin: -2rem auto 2rem;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .form > div {
          margin-bottom: 1rem;
        }
        .form label {
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
        }
        .form input,
        .form select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .form button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #4f9dff;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        .form button:disabled {
          background: #9bbdfc;
          cursor: default;
        }
        .error {
          color: #b00020;
          margin-top: 1rem;
        }
        .result {
          margin-top: 2rem;
        }
        .result pre {
          background: #f0f4f8;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .loading {
          font-style: italic;
          color: #666;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
