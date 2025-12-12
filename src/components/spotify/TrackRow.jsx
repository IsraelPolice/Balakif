import { Play, Pause, Clock, Headphones } from 'lucide-react';
import { useState } from 'react';

export default function TrackRow({ track, index, isPlaying, onPlay, listenCount = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatListenCount = (count) => {
    return count < 50 ? '<50' : count.toLocaleString('he-IL');
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
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="truncate">{track.artist_names?.join(', ')}</span>
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500">
              <Headphones className="w-3 h-3" />
              {formatListenCount(listenCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Album - hidden on mobile */}
      <div className="hidden md:flex items-center text-sm text-gray-400">
        <span className="truncate">Hevre Hits</span>
      </div>

      {/* Duration & Listens (Mobile) */}
      <div className="flex flex-col items-end justify-center gap-1">
        <div className="flex items-center text-sm text-gray-400">
          <Clock className="w-3.5 h-3.5 mr-1 md:hidden" />
          <span className="hidden md:inline">{formatDuration(track.duration)}</span>
          <span className="md:hidden text-xs">{formatDuration(track.duration)}</span>
        </div>
        <div className="md:hidden flex items-center gap-1 text-xs text-gray-500">
          <Headphones className="w-3 h-3" />
          {formatListenCount(listenCount)}
        </div>
      </div>
    </div>
  );
}
