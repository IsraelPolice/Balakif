import { Play, Pause, Clock } from 'lucide-react';
import { useState } from 'react';

export default function TrackRow({ track, index, isPlaying, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
      className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[16px_4fr_2fr_1fr] gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-2.5 rounded-md hover:bg-gray-800 group cursor-pointer active:scale-[0.99] transition-all ${
        isPlaying ? 'bg-gray-800' : ''
      }`}
    >
      {/* Number / Play Button */}
      <div className="flex items-center justify-center text-gray-400 w-5">
        {isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            <div className="w-1 bg-green-500 animate-pulse" style={{ height: '40%' }}></div>
            <div className="w-1 bg-green-500 animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
            <div className="w-1 bg-green-500 animate-pulse" style={{ height: '60%', animationDelay: '0.4s' }}></div>
          </div>
        ) : isHovered ? (
          <Play className="w-4 h-4 text-white" fill="white" />
        ) : (
          <span className="text-sm">{index + 1}</span>
        )}
      </div>

      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={track.cover_image || 'https://via.placeholder.com/40'}
          alt={track.title}
          className="w-12 h-12 md:w-11 md:h-11 rounded-md shadow-md"
        />
        <div className="min-w-0 flex-1">
          <div className={`text-base md:text-base font-semibold truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
            {track.title}
          </div>
          <div className="text-sm md:text-sm text-gray-400 truncate">
            {track.artist_names?.join(', ')}
          </div>
        </div>
      </div>

      {/* Album - hidden on mobile */}
      <div className="hidden md:flex items-center text-sm text-gray-400">
        <span className="truncate">Hevre Hits</span>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-end text-sm text-gray-400">
        <Clock className="w-4 h-4 mr-1.5 md:hidden" />
        {formatDuration(track.duration)}
      </div>
    </div>
  );
}
