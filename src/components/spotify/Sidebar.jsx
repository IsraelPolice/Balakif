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
            <img
              src="https://i.ibb.co/PvgqzZPB/Gemini-Generated-Image-a7xqq1a7xqq1a7xq-1.png"
              alt="Hevre Spotify"
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-white text-2xl font-bold">Hevre Spotify</h1>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-50">
        <nav className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.id === 'liked' ? (
                  <div className={`w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-400 rounded flex items-center justify-center ${isActive ? 'scale-110' : ''}`}>
                    <Heart className="w-4 h-4 text-white" fill="white" />
                  </div>
                ) : (
                  <Icon className={`w-6 h-6 ${isActive ? 'text-green-500' : ''}`} />
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-40 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/PvgqzZPB/Gemini-Generated-Image-a7xqq1a7xqq1a7xq-1.png"
              alt="Hevre Spotify"
              className="w-8 h-8 rounded-lg"
            />
            <h1 className="text-white text-base font-bold">Hevre Spotify</h1>
          </div>
          <a
            href="/pages/main.html"
            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-colors"
          >
            חזרה
          </a>
        </div>
      </div>
    </>
  );
}
