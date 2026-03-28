import { useGame } from '../context/GameContext';

export default function XPNotification() {
  const { notification, xpAnimation } = useGame();

  return (
    <>
      {/* XP Gain animation */}
      {xpAnimation && (
        <div
          key={xpAnimation.id}
          className="fixed top-20 right-4 z-[100] pointer-events-none animate-slide-up"
        >
          <div className="bg-yellow-400 text-yellow-900 font-black text-lg px-4 py-2 rounded-full shadow-lg border-2 border-yellow-500">
            +{xpAnimation.amount} XP ⭐
          </div>
        </div>
      )}

      {/* Badge / Message notification */}
      {notification && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[200] p-4 pointer-events-none">
          <div className="animate-slide-up">
            {notification.type === 'badge' && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <div className="text-4xl animate-wiggle">{notification.badge.emoji}</div>
                <div>
                  <p className="text-xs opacity-80 font-medium">新徽章解锁！</p>
                  <p className="font-black text-lg">{notification.badge.name}</p>
                  <p className="text-xs opacity-80">{notification.badge.desc}</p>
                </div>
              </div>
            )}
            {notification.type === 'message' && (
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-4 shadow-2xl text-center">
                <p className="font-bold text-lg">{notification.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
