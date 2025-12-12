import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '../components/spotify/Sidebar';
import PlayerBar from '../components/spotify/PlayerBar';
import ArtistCard from '../components/spotify/ArtistCard';
import TrackRow from '../components/spotify/TrackRow';
import { Music2, TrendingUp } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function HebreSpotify() {
  const [currentView, setCurrentView] = useState('home');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [artistsRes, tracksRes] = await Promise.all([
        supabase.from('artists').select('*').order('name'),
        supabase.from('tracks').select('*').order('created_at', { ascending: false })
      ]);

      if (artistsRes.data) setArtists(artistsRes.data);
      if (tracksRes.data) setTracks(tracksRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrack(tracks[prevIndex]);
    setCurrentTrackIndex(prevIndex);
  };

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    setCurrentView('artist');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view === 'home') {
      setSelectedArtist(null);
    }
  };

  const getArtistTracks = (artistName) => {
    return tracks.filter(track => track.artist_names?.includes(artistName));
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">טוען...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col" dir="rtl">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'home' && (
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-5xl font-bold mb-2">שלום</h1>
                <p className="text-gray-400">מה בא לך לשמוע היום?</p>
              </div>

              {/* Popular Tracks */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <h2 className="text-3xl font-bold">השירים הפופולריים</h2>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 mb-2">
                    <div>#</div>
                    <div>שם</div>
                    <div>אלבום</div>
                    <div className="text-left">משך</div>
                  </div>
                  {tracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={currentTrack?.id === track.id}
                      onPlay={() => handlePlayTrack(track, index)}
                    />
                  ))}
                </div>
              </section>

              {/* Artists */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Music2 className="w-8 h-8 text-green-500" />
                  <h2 className="text-3xl font-bold">האמנים שלנו</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {artists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onClick={() => handleArtistClick(artist)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {currentView === 'artist' && selectedArtist && (
            <div className="min-h-full">
              {/* Artist Header */}
              <div
                className="relative h-80 bg-gradient-to-b from-green-800 to-transparent p-8 flex items-end"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${selectedArtist.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="flex items-end gap-6">
                  <img
                    src={selectedArtist.image_url}
                    alt={selectedArtist.name}
                    className="w-48 h-48 rounded-full shadow-2xl border-4 border-white"
                  />
                  <div>
                    <p className="text-sm font-semibold mb-2">אמן</p>
                    <h1 className="text-7xl font-black mb-4">{selectedArtist.name}</h1>
                    <p className="text-lg text-gray-200">{selectedArtist.bio}</p>
                  </div>
                </div>
              </div>

              {/* Artist Tracks */}
              <div className="p-8 bg-gradient-to-b from-black/40 to-black">
                <h2 className="text-2xl font-bold mb-6">שירים פופולריים</h2>
                <div className="bg-black/30 rounded-lg p-4">
                  {getArtistTracks(selectedArtist.name).map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={currentTrack?.id === track.id}
                      onPlay={() => handlePlayTrack(track, index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'search' && (
            <div className="p-8">
              <h1 className="text-5xl font-bold mb-8">חיפוש</h1>
              <input
                type="text"
                placeholder="מה בא לך לשמוע?"
                className="w-full max-w-2xl px-6 py-4 bg-white text-black rounded-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {currentView === 'library' && (
            <div className="p-8">
              <h1 className="text-5xl font-bold mb-8">הספרייה שלך</h1>
              <div className="text-gray-400">בקרוב...</div>
            </div>
          )}

          {currentView === 'liked' && (
            <div className="p-8">
              <h1 className="text-5xl font-bold mb-8">שירים שאהבתי</h1>
              <div className="text-gray-400">בקרוב...</div>
            </div>
          )}
        </div>
      </div>

      {/* Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* SoundCloud Player Modal */}
      {currentTrack && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-96 z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-3 bg-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">מנגן מוסיקה</span>
            <button
              onClick={() => setCurrentTrack(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={currentTrack.soundcloud_url}
          />
        </div>
      )}
    </div>
  );
}
