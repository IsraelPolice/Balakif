import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle } from 'lucide-react';

export default function PlayerBar({ currentTrack, onNext, onPrevious }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  if (!currentTrack) {
    return (
      <div className="h-20 md:h-24 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 px-4 flex items-center justify-center">
        <p className="text-gray-500 text-sm">בחר שיר להשמעה</p>
      </div>
    );
  }

  return (
    <div className="h-16 md:h-24 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 px-2 md:px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 max-w-[35%] md:max-w-none">
        <img
          src={currentTrack.cover_image}
          alt={currentTrack.title}
          className="w-11 h-11 md:w-14 md:h-14 rounded shadow-lg"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold text-xs md:text-sm truncate leading-tight">
            {currentTrack.title}
          </h4>
          <p className="text-gray-400 text-[10px] md:text-xs truncate mt-0.5">
            {currentTrack.artist_names?.join(', ')}
          </p>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="hidden md:block text-gray-400 hover:text-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? 'fill-green-500 text-green-500' : ''}`}
          />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-3 md:gap-4">
          <button className="hidden md:block text-gray-400 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={onPrevious}
            className="text-gray-400 hover:text-white active:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5 text-black" fill="black" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 text-black ml-0.5" fill="black" />
            )}
          </button>
          <button
            onClick={onNext}
            className="text-gray-400 hover:text-white active:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="hidden md:block text-gray-400 hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden">
          {currentTrack && (
            <iframe
              ref={iframeRef}
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={currentTrack.soundcloud_url}
            />
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="70"
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
}
