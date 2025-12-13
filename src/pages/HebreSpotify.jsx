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
  const [searchQuery, setSearchQuery] = useState('');
  const [trackListens, setTrackListens] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [artistsRes, tracksRes, listensRes] = await Promise.all([
        supabase.from('artists').select('*').order('name'),
        supabase.from('tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('track_listens').select('*')
      ]);

      if (artistsRes.data) setArtists(artistsRes.data);
      if (tracksRes.data) setTracks(tracksRes.data);

      if (listensRes.data) {
        const listensMap = {};
        listensRes.data.forEach(listen => {
          listensMap[listen.track_id] = listen.listen_count;
        });
        setTrackListens(listensMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track, index) => {
    const autoplayUrl = track.soundcloud_url.replace('auto_play=false', 'auto_play=true');
    setCurrentTrack({ ...track, soundcloud_url: autoplayUrl });
    setCurrentTrackIndex(index);

    try {
      const { data, error } = await supabase.rpc('increment_track_listens', {
        p_track_id: track.id
      });

      if (!error && data) {
        setTrackListens(prev => ({
          ...prev,
          [track.id]: data
        }));
      }
    } catch (error) {
      console.error('Error incrementing listens:', error);
    }
  };

  const handleNext = async () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    const track = tracks[nextIndex];
    await handlePlayTrack(track, nextIndex);
  };

  const handlePrevious = async () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    const track = tracks[prevIndex];
    await handlePlayTrack(track, prevIndex);
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

  const getRelatedArtists = (currentArtist) => {
    const artistTracks = getArtistTracks(currentArtist.name);
    const collaboratorScores = new Map();

    artistTracks.forEach(track => {
      track.artist_names?.forEach(name => {
        if (name !== currentArtist.name) {
          collaboratorScores.set(name, (collaboratorScores.get(name) || 0) + 5);
        }
      });
    });

    const allArtists = artists.filter(artist => artist.name !== currentArtist.name);

    const relatedWithScores = allArtists.map(artist => ({
      artist,
      score: collaboratorScores.get(artist.name) || 0
    }));

    const collaborators = relatedWithScores.filter(item => item.score > 0);
    const others = relatedWithScores.filter(item => item.score === 0);

    const shuffledOthers = others.sort(() => Math.random() - 0.5);

    const finalList = [
      ...collaborators.sort((a, b) => b.score - a.score),
      ...shuffledOthers
    ];

    return finalList.slice(0, 8).map(item => item.artist);
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { tracks: [], artists: [] };

    const query = searchQuery.toLowerCase();
    const filteredTracks = tracks.filter(track =>
      track.title?.toLowerCase().includes(query) ||
      track.album?.toLowerCase().includes(query) ||
      track.artist_names?.some(artist => artist.toLowerCase().includes(query))
    );

    const filteredArtists = artists.filter(artist =>
      artist.name.toLowerCase().includes(query) ||
      artist.bio?.toLowerCase().includes(query)
    );

    return { tracks: filteredTracks, artists: filteredArtists };
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
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-28 pt-12 md:pt-0">
          {currentView === 'home' && (
            <div className="px-4 py-4 md:p-8">
              <div className="mb-5 md:mb-8">
                <h1 className="text-2xl md:text-5xl font-bold mb-1.5 md:mb-2">שלום</h1>
                <p className="text-xs md:text-base text-gray-400">מה בא לך לשמוע היום?</p>
              </div>

              <section className="mb-6 md:mb-12">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
                  <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-green-500" />
                  <h2 className="text-lg md:text-3xl font-bold">השירים הפופולריים</h2>
                </div>
                <div className="bg-transparent md:bg-gray-900 md:rounded-lg md:p-4">
                  <div className="hidden md:grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 mb-2">
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
                      listenCount={trackListens[track.id] || 0}
                    />
                  ))}
                </div>
              </section>

              <section className="pb-6">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
                  <Music2 className="w-5 h-5 md:w-8 md:h-8 text-green-500" />
                  <h2 className="text-lg md:text-3xl font-bold">האמנים שלנו</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-4">
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
            <div className="min-h-full pb-24 md:pb-32">
              <div
                className="relative h-48 md:h-80 bg-gradient-to-b from-green-800 to-transparent px-3 pt-3 pb-4 md:p-8 flex items-end"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${selectedArtist.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-end gap-2.5 md:gap-6 w-full">
                  <img
                    src={selectedArtist.image_url}
                    alt={selectedArtist.name}
                    className="w-24 h-24 md:w-48 md:h-48 rounded-full shadow-2xl border-2 md:border-4 border-white"
                  />
                  <div className="text-center md:text-right">
                    <p className="text-[9px] md:text-sm font-semibold mb-0.5 md:mb-2 opacity-90">אמן</p>
                    <h1 className="text-2xl md:text-7xl font-black mb-0.5 md:mb-4 leading-tight">{selectedArtist.name}</h1>
                    <p className="text-[11px] md:text-lg text-gray-200 leading-snug">{selectedArtist.bio}</p>
                    {selectedArtist.stats?.awards && (
                      <p className="text-[9px] md:text-sm text-green-400 mt-0.5 md:mt-2">{selectedArtist.stats.awards}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-3 py-4 md:p-8 bg-gradient-to-b from-black/40 to-black">
                <h2 className="text-sm md:text-2xl font-bold mb-2.5 md:mb-6">שירים פופולריים</h2>
                <div className="bg-transparent md:bg-black/30 md:rounded-lg md:p-4">
                  {getArtistTracks(selectedArtist.name).map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={currentTrack?.id === track.id}
                      onPlay={() => handlePlayTrack(track, index)}
                      listenCount={trackListens[track.id] || 0}
                    />
                  ))}
                </div>

                {getRelatedArtists(selectedArtist).length > 0 && (
                  <div className="mt-5 md:mt-12">
                    <h2 className="text-sm md:text-2xl font-bold mb-2.5 md:mb-6">אמנים נוספים שאולי תאהבו</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                      {getRelatedArtists(selectedArtist).map((artist) => (
                        <ArtistCard
                          key={artist.id}
                          artist={artist}
                          onClick={() => handleArtistClick(artist)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'search' && (
            <div className="px-4 py-4 md:p-8">
              <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-8">חיפוש</h1>
              <input
                type="text"
                placeholder="מה בא לך לשמוע?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full max-w-2xl px-4 md:px-6 py-2.5 md:py-4 bg-white text-black rounded-full text-sm md:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg"
              />

              {searchQuery.trim() && (
                <div className="mt-5 md:mt-8">
                  {getSearchResults().artists.length > 0 && (
                    <section className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-5">אמנים</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-4">
                        {getSearchResults().artists.map((artist) => (
                          <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onClick={() => handleArtistClick(artist)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {getSearchResults().tracks.length > 0 && (
                    <section>
                      <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-5">שירים</h2>
                      <div className="bg-transparent md:bg-gray-900 md:rounded-lg md:p-4">
                        {getSearchResults().tracks.map((track, index) => (
                          <TrackRow
                            key={track.id}
                            track={track}
                            index={index}
                            isPlaying={currentTrack?.id === track.id}
                            onPlay={() => handlePlayTrack(track, index)}
                            listenCount={trackListens[track.id] || 0}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {getSearchResults().artists.length === 0 && getSearchResults().tracks.length === 0 && (
                    <div className="text-center text-gray-400 mt-12 md:mt-16">
                      <p className="text-sm md:text-xl">לא נמצאו תוצאות עבור "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentView === 'library' && (
            <div className="px-4 py-4 md:p-8">
              <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-8">הספרייה שלך</h1>
              <div className="text-gray-400 text-sm md:text-base">בקרוב...</div>
            </div>
          )}

          {currentView === 'liked' && (
            <div className="px-4 py-4 md:p-8">
              <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-8">שירים שאהבתי</h1>
              <div className="text-gray-400 text-sm md:text-base">בקרוב...</div>
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

      {currentTrack && (
        <div className="fixed bottom-20 md:bottom-28 left-2 right-2 md:right-4 md:left-auto md:w-96 z-50 bg-gray-900 rounded-lg shadow-2xl border border-green-500 overflow-hidden">
          <div className="p-2 md:p-3 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-[10px] md:text-sm font-bold text-white">מנגן עכשיו</span>
            </div>
            <button
              onClick={() => setCurrentTrack(null)}
              className="text-white hover:text-gray-200 active:text-gray-300 font-bold text-sm md:text-lg w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <iframe
            key={currentTrack.id}
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
