import { Play } from 'lucide-react';

export default function ArtistCard({ artist, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-900 rounded-lg p-4 md:p-4 hover:bg-gray-800 transition-all cursor-pointer group active:scale-95"
    >
      <div className="relative mb-4">
        <img
          src={artist.image_url || 'https://via.placeholder.com/200'}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-full shadow-lg"
        />
        <button className="absolute bottom-2 right-2 w-11 h-11 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl opacity-0 md:group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
          <Play className="w-5 h-5 md:w-6 md:h-6 text-black ml-0.5" fill="black" />
        </button>
      </div>
      <h3 className="text-white font-bold text-base md:text-lg mb-1 truncate">{artist.name}</h3>
      <p className="text-gray-400 text-sm">אמן</p>
    </div>
  );
}
