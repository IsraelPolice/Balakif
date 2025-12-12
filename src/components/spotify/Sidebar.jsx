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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe">
        <nav className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 flex-1 transition-all ${
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
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black/98 backdrop-blur-lg border-b border-gray-800/70 z-40 px-4 py-2.5 safe-top">
        <div className="flex items-center justify-between h-11">
          <div className="flex items-center gap-2">
            <Music className="w-7 h-7 text-green-500" />
            <h1 className="text-white text-base font-bold tracking-tight">Hevre Spotify</h1>
          </div>
          <a
            href="/pages/main.html"
            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-full font-semibold transition-all shadow-md"
          >
            חזרה
          </a>
        </div>
      </div>
    </>
  );
}
