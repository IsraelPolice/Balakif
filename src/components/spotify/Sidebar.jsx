import { Home, Search, Library, Music, Heart } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate }) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'בית', nameEn: 'Home' },
    { id: 'search', icon: Search, label: 'חיפוש', nameEn: 'Search' },
    { id: 'library', icon: Library, label: 'הספרייה שלך', nameEn: 'Your Library' },
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-green-500" />
          <h1 className="text-white text-2xl font-bold">Hevre Spotify</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
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
  );
}
