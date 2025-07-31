import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Supabase init
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default function HomePage() {
  const router = useRouter();
  const { id } = router.query;

  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState(7);
  const [preferences, setPreferences] = useState('');
  const [budget, setBudget] = useState('mid-range');
  const [pace, setPace] = useState('medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState('');
  const [shareLink, setShareLink] = useState('');

  // When arriving with an id parameter, fetch cached itinerary
  useEffect(() => {
    async function fetchItinerary() {
      if (id && typeof id === 'string') {
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
      if (!response.ok) throw new Error(data.error || 'Failed to generate itinerary');
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
      <Head>
        <title>AI Itinerary Builder</title>
        <meta name="description" content="Create personalized travel plans powered by AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Hero Section */}
      <section className="hero">
        <div className="overlay">
          <h1>Plan Your Dream Trip with AI</h1>
          <p>Create and share professional‑quality itineraries in minutes.</p>
        </div>
      </section>

      {/* Form & Itinerary */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          <div><label>Destination</label><input type="text" required value={destination} onChange={e => setDestination(e.target.value)} /></div>
          <div><label>Trip Length (days)</label><input type="number" min="1" value={tripLength} onChange={e => setTripLength(parseInt(e.target.value))} /></div>
          <div><label>Preferences (e.g. nature, cities, food)</label><input type="text" value={preferences} onChange={e => setPreferences(e.target.value)} /></div>
          <div><label>Budget</label>
            <select value={budget} onChange={e => setBudget(e.target.value)}>
              <option value="economy">Economy</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <div><label>Pace</label>
            <select value={pace} onChange={e => setPace(e.target.value)}>
              <option value="relaxed">Relaxed</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Generating…' : 'Generate Itinerary'}</button>
        </form>

        {error && <p className="error">Error: {error}</p>}
        {itinerary && (
          <div className="result">
            <h2>Your Itinerary</h2>
            <pre>{itinerary}</pre>
            {shareLink && (
              <p><strong>Shareable Link:&nbsp;</strong><a href={shareLink}>{shareLink}</a></p>
            )}
          </div>
        )}
        {!itinerary && !loading && id && <div className="loading">Loading itinerary…</div>}
      </div>

      {/* Feature Section */}
      <section className="features">
        <h2>Why Travel with Us?</h2>
        <div className="feature-grid">
          <div className="feature">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3fb?auto=format&fit=crop&w=600&q=80" alt="Nature exploration" />
            <h3>Breathtaking Nature</h3>
            <p>Find hidden gems from cliffs to fjords and rolling green hills.</p>
          </div>
          <div className="feature">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3fb?auto=format&fit=crop&w=600&q=80" alt="Vibrant towns" />
            <h3>Vibrant Towns</h3>
            <p>Experience lively towns, music scenes, and authentic pubs.</p>
          </div>
          <div className="feature">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3fb?auto=format&fit=crop&w=600&q=80" alt="Custom routes" />
            <h3>Custom Routes</h3>
            <p>Your itinerary is tailored to your pace and budget — no cookie cutter tours.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          position: relative;
          height: 60vh;
          background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1500&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero .overlay {
          text-align: center;
          color: #fff;
        }
        .hero h1 {
          font-size: 3rem;
          margin: 0;
        }
        .hero p {
          font-size: 1.2rem;
          margin-top: 0.5rem;
        }
        .form-container {
          max-width: 800px;
          margin: -4rem auto 2rem;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .form div { margin-bottom: 1rem; }
        .form label { font-weight: 600; display: block; margin-bottom: 0.5rem; }
        .form input, .form select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .form button {
          width: 100%;
          padding: 0.75rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        .form button:disabled { background: #9bbdfc; }
        .error { color: #b00020; margin-top: 1rem; }
        .result { margin-top: 2rem; }
        .result pre {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        .features { text-align: center; padding: 4rem 1rem; background: #fafafa; }
        .features h2 { font-size: 2rem; margin-bottom: 2rem; }
        .feature-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
        }
        .feature {
          max-width: 300px;
          text-align: center;
        }
        .feature img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .feature h3 { margin-top: 1rem; font-size: 1.2rem; }
        .feature p { margin-top: 0.5rem; color: #555; }
      `}</style>
    </>
  );
}
