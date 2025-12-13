import { Home, Search, Library, Music, Heart } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate }) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'בית', nameEn: 'Home' },
    { id: 'search', icon: Search, label: 'חיפוש', nameEn: 'Search' },
    { id: 'library', icon: Library, label: 'ספרייה', nameEn: 'Your Library' },
    { id: 'liked', icon: Heart, label: 'אהבתי', nameEn: 'Liked' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-black h-full flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Music className="w-10 h-10 text-green-500" />
            <h1 className="text-white text-xl font-bold">Hevre Spotify</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <ul className="space-y-2">
            {menuItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={() => onNavigate('liked')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                currentView === 'liked'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-400 rounded flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-semibold">שירים שאהבתי</span>
            </button>
          </div>
        </nav>

        {/* Back to main */}
        <div className="p-4 border-t border-gray-800">
          <a
            href="/pages/main.html"
            className="block w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-center font-semibold transition-colors"
          >
            ← חזרה לדף הראשי
          </a>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/98 backdrop-blur-lg border-t border-gray-800 z-50">
        <nav className="flex justify-around items-center h-16 px-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 flex-1 transition-all ${
                  isActive ? 'text-white' : 'text-gray-400 active:scale-95'
                }`}
              >
                {item.id === 'liked' ? (
                  <div className={`w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-400 rounded flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                  </div>
                ) : (
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : ''}`} />
                )}
                <span className={`text-[9px] md:text-[10px] font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-black/98 backdrop-blur-lg border-b border-gray-800/50 z-40 px-3 py-2">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-green-500" />
            <h1 className="text-white text-sm font-bold">Hevre Spotify</h1>
          </div>
          <a
            href="/pages/main.html"
            className="text-[10px] px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-full font-semibold transition-all"
          >
            חזרה
          </a>
        </div>
      </div>
    </>
  );
}
