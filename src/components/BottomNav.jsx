import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', emoji: '🏠', label: '首页' },
  { path: '/oral', emoji: '🎤', label: '口语' },
  { path: '/composition', emoji: '✍️', label: '作文' },
  { path: '/listening', emoji: '👂', label: '听力' },
  { path: '/profile', emoji: '⭐', label: '奖励' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Portrait: bottom nav */}
      <nav className="landscape:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t-2 border-orange-100 z-50 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ path, emoji, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-100 scale-110'
                    : 'hover:bg-gray-50 active:scale-95'
                }`}
              >
                <span className={`text-2xl ${isActive ? 'animate-bounce-slow' : ''}`}>{emoji}</span>
                <span className={`text-xs font-bold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Landscape: side nav */}
      <nav className="hidden landscape:flex fixed left-0 top-0 bottom-0 w-16 bg-white border-r-2 border-orange-100 z-50 flex-col items-center justify-center gap-1 py-2">
        {navItems.map(({ path, emoji, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-orange-100 scale-105'
                  : 'hover:bg-gray-50 active:scale-95'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
