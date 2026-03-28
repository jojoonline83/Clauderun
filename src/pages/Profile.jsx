import { useState } from 'react';
import { useGame } from '../context/GameContext';
import ProgressBar from '../components/ProgressBar';

const MOTIVATIONAL_MESSAGES = [
  "每一步都算数！继续加油！🌟",
  "你比昨天的自己更棒了！💪",
  "学华文很难，但你做到了！🎉",
  "每个成功都从努力开始！✨",
  "你的坚持是最好的礼物！🏆",
];

export default function Profile() {
  const {
    stats,
    getCurrentLevel,
    getNextLevel,
    getLevelProgress,
    BADGES,
    LEVELS,
    updateName,
    updateAvatar,
  } = useGame();

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.name);
  const [activeTab, setActiveTab] = useState('stats');

  const level = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getLevelProgress();
  const msgIndex = stats.totalXP % MOTIVATIONAL_MESSAGES.length;

  const AVATARS = ['🐼', '🐯', '🦊', '🐰', '🐸', '🦁', '🐧', '🐝', '🦋', '🐬'];

  const handleSaveName = () => {
    if (tempName.trim()) updateName(tempName.trim());
    setEditingName(false);
  };

  const totalActivities = stats.oralCompleted + stats.compositionCompleted + stats.listeningCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 pt-12 pb-8 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar selector */}
          <div className="text-6xl animate-float">{stats.avatar}</div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={10}
                  className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/40 rounded-xl px-3 py-1.5 text-lg font-black focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="bg-white text-purple-500 font-black px-3 py-1.5 rounded-xl text-sm"
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-left"
              >
                <h1 className="text-white text-2xl font-black">{stats.name}</h1>
                <p className="text-white/70 text-xs">点击修改名字 ✏️</p>
              </button>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white text-sm">{level.emoji} {level.name}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Lv.{level.level}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4 bg-white/20 rounded-2xl p-3 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-bold">⭐ {stats.totalXP} XP</span>
            {nextLevel ? (
              <span className="text-white/80 text-xs">目标：{nextLevel.minXP} XP</span>
            ) : (
              <span className="text-white/80 text-xs">已到达最高等级！</span>
            )}
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-3 relative z-10">
          <p className="text-white/90 text-sm text-center font-medium">{MOTIVATIONAL_MESSAGES[msgIndex]}</p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="px-5 mt-4">
        <div className="flex gap-2 bg-purple-50 rounded-2xl p-1.5">
          {[
            { id: 'stats', label: '我的成绩', emoji: '📊' },
            { id: 'badges', label: '我的徽章', emoji: '🏅' },
            { id: 'levels', label: '等级系统', emoji: '🏆' },
            { id: 'avatar', label: '我的头像', emoji: '🎨' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all font-bold text-xs ${
                activeTab === tab.id ? 'bg-white text-purple-500 shadow-sm' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '总XP', value: stats.totalXP, emoji: '⭐', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                { label: '总练习', value: totalActivities, emoji: '📚', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                { label: '获得徽章', value: stats.earnedBadges.length, emoji: '🏅', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: '满分次数', value: stats.perfectScores, emoji: '💎', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' },
              ].map(({ label, value, emoji, color, bg, border }) => (
                <div key={label} className={`${bg} border-2 ${border} rounded-2xl p-4 text-center`}>
                  <div className="text-3xl mb-1">{emoji}</div>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-100 p-4 space-y-4">
              <h3 className="font-black text-gray-800">各项练习进度</h3>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-orange-500">🎤 口语练习</span>
                  <span className="text-sm font-bold text-gray-500">{stats.oralCompleted} 次</span>
                </div>
                <ProgressBar value={stats.oralCompleted} max={Math.max(10, stats.oralCompleted + 3)} color="orange" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-purple-500">✍️ 作文练习</span>
                  <span className="text-sm font-bold text-gray-500">{stats.compositionCompleted} 次</span>
                </div>
                <ProgressBar value={stats.compositionCompleted} max={Math.max(10, stats.compositionCompleted + 3)} color="purple" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-green-500">👂 听力练习</span>
                  <span className="text-sm font-bold text-gray-500">{stats.listeningCompleted} 次</span>
                </div>
                <ProgressBar value={stats.listeningCompleted} max={Math.max(10, stats.listeningCompleted + 3)} color="green" />
              </div>
            </div>
          </>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <>
            <div className="text-center bg-purple-50 rounded-2xl p-3 border-2 border-purple-100">
              <p className="font-bold text-purple-600">已获得 {stats.earnedBadges.length} / {BADGES.length} 个徽章</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map(badge => {
                const earned = stats.earnedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border-2 p-4 text-center transition-all ${
                      earned
                        ? 'border-yellow-300 bg-yellow-50 shadow-md'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${earned ? 'animate-bounce-slow' : 'grayscale'}`}>
                      {badge.emoji}
                    </div>
                    <p className={`font-black text-sm ${earned ? 'text-gray-800' : 'text-gray-400'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                    {earned && (
                      <span className="text-xs bg-yellow-200 text-yellow-700 rounded-full px-2 py-0.5 font-bold mt-1 inline-block">
                        已获得 ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <div className="space-y-3">
            {LEVELS.map((lvl) => {
              const isCurrent = lvl.level === level.level;
              const isUnlocked = stats.totalXP >= lvl.minXP;
              return (
                <div
                  key={lvl.level}
                  className={`rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${
                    isCurrent
                      ? 'border-orange-300 bg-orange-50 shadow-md'
                      : isUnlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>{lvl.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-black ${isCurrent ? 'text-orange-600' : 'text-gray-800'}`}>
                        Lv.{lvl.level} {lvl.name}
                      </p>
                      {isCurrent && <span className="text-xs bg-orange-200 text-orange-700 rounded-full px-2 py-0.5 font-bold">当前</span>}
                      {isUnlocked && !isCurrent && <span className="text-xs bg-green-200 text-green-700 rounded-full px-2 py-0.5 font-bold">已解锁</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">需要 {lvl.minXP} XP</p>
                    {isCurrent && nextLevel && (
                      <div className="mt-2">
                        <ProgressBar value={stats.totalXP - lvl.minXP} max={nextLevel.minXP - lvl.minXP} color="orange" />
                        <p className="text-xs text-gray-400 mt-1">还差 {nextLevel.minXP - stats.totalXP} XP 升级</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-8xl animate-float mb-4">{stats.avatar}</div>
              <p className="font-bold text-gray-600">你现在的头像</p>
            </div>
            <p className="font-bold text-gray-700">选一个新头像</p>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => updateAvatar(avatar)}
                  className={`text-4xl py-3 rounded-2xl transition-all ${
                    stats.avatar === avatar
                      ? 'bg-orange-100 scale-110 border-2 border-orange-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 active:scale-95'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-100 text-center">
              <p className="text-sm font-bold text-orange-600">点击头像马上换！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
