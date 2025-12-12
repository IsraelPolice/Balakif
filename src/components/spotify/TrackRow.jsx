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
      className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 rounded hover:bg-gray-800 group cursor-pointer ${
        isPlaying ? 'bg-gray-800' : ''
      }`}
    >
      {/* Number / Play Button */}
      <div className="flex items-center justify-center text-gray-400">
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
          className="w-10 h-10 rounded"
        />
        <div className="min-w-0">
          <div className={`font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
            {track.title}
          </div>
          <div className="text-sm text-gray-400 truncate">
            {track.artist_names?.join(', ')}
          </div>
        </div>
      </div>

      {/* Album - we'll skip for now */}
      <div className="flex items-center text-sm text-gray-400">
        <span className="truncate">Hevre Hits</span>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-end text-sm text-gray-400">
        <Clock className="w-4 h-4 mr-2" />
        {formatDuration(track.duration)}
      </div>
    </div>
  );
}
