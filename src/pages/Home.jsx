import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

const AVATARS = ['🐼', '🐯', '🦊', '🐰', '🐸', '🦁', '🐧', '🐝', '🦋', '🐬'];

const dailyTips = [
  "每天学五个新词语，一年就能学会一千八百个词！",
  "读书破万卷，下笔如有神！多阅读，作文写得更好。",
  "说话前先想好，说话时要大声、清楚！",
  "好奇心是最好的老师，遇到不懂的字要查字典！",
  "华文是我们的母语，学好它，我们会更自豪！",
  "用华文和家人聊天，这是最好的练习方法！",
  "写作文时，先想好开头、中间和结尾，写起来更容易！",
];

const sections = [
  {
    path: '/oral',
    emoji: '🎤',
    title: '口语练习',
    titleEn: 'Oral Practice',
    desc: '看图说话 · 朗读 · 会话',
    color: 'from-orange-400 to-pink-400',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    tasks: ['看图说话', '朗读练习', '情境会话'],
  },
  {
    path: '/composition',
    emoji: '✍️',
    title: '作文练习',
    titleEn: 'Composition',
    desc: '看图作文 · 词语 · 句子',
    color: 'from-purple-400 to-blue-400',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    tasks: ['看图作文', '词语学习', '句子造句'],
  },
  {
    path: '/listening',
    emoji: '👂',
    title: '听力练习',
    titleEn: 'Listening',
    desc: '听故事 · 听写 · 听辨',
    color: 'from-green-400 to-teal-400',
    bg: 'bg-green-50',
    border: 'border-green-200',
    tasks: ['听故事答题', '词语听写', '听辨选择'],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { stats, getCurrentLevel, getNextLevel, getLevelProgress, updateName, updateAvatar } = useGame();
  const [showSetup, setShowSetup] = useState(false);
  const [tempName, setTempName] = useState(stats.name);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar);
  const [tipIndex] = useState(() => Math.floor(Math.random() * dailyTips.length));

  const level = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getLevelProgress();

  const isFirstVisit = stats.totalXP === 0 && stats.name === '小朋友';

  useEffect(() => {
    if (isFirstVisit) setShowSetup(true);
  }, []);

  const handleSaveSetup = () => {
    if (tempName.trim()) updateName(tempName.trim());
    updateAvatar(selectedAvatar);
    setShowSetup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 pt-12 pb-8 px-5 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">你好，</p>
            <h1 className="text-white text-2xl font-black mb-1">{stats.name}！👋</h1>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{level.emoji} {level.name}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Lv.{level.level}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="text-5xl animate-float active:scale-90 transition-transform"
          >
            {stats.avatar}
          </button>
        </div>

        {/* XP Progress */}
        <div className="mt-4 bg-white/20 rounded-2xl p-3 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-bold">⭐ {stats.totalXP} XP</span>
            {nextLevel && (
              <span className="text-white/80 text-xs">
                距离 {nextLevel.emoji} {nextLevel.name} 还差 {nextLevel.minXP - stats.totalXP} XP
              </span>
            )}
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mascot + Daily Tip */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-4 flex items-center gap-4">
          <div className="text-5xl animate-float flex-shrink-0">🐼</div>
          <div>
            <p className="text-xs text-orange-400 font-bold mb-1">📚 每日小贴士</p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">{dailyTips[tipIndex]}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 mt-4 grid grid-cols-3 gap-3">
        {[
          { label: '口语', value: stats.oralCompleted, emoji: '🎤', color: 'text-orange-500' },
          { label: '作文', value: stats.compositionCompleted, emoji: '✍️', color: 'text-purple-500' },
          { label: '听力', value: stats.listeningCompleted, emoji: '👂', color: 'text-green-500' },
        ].map(({ label, value, emoji, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-gray-400">{label}练习</div>
          </div>
        ))}
      </div>

      {/* Section Cards */}
      <div className="px-5 mt-5">
        <h2 className="text-lg font-black text-gray-800 mb-3">今天学什么？📖</h2>
        <div className="space-y-3">
          {sections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={`w-full ${section.bg} border-2 ${section.border} rounded-3xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                {section.emoji}
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-800">{section.title}</h3>
                  <span className="text-xs text-gray-400">{section.titleEn}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {section.tasks.map(task => (
                    <span key={task} className="text-xs bg-white/70 rounded-full px-2 py-0.5 text-gray-600 font-medium">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-2xl text-gray-300">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Teaser */}
      {stats.earnedBadges.length > 0 && (
        <div className="px-5 mt-5">
          <div
            className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-3xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => navigate('/profile')}
          >
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-black text-gray-800">我的成就</p>
              <p className="text-sm text-gray-500">已获得 {stats.earnedBadges.length} 个徽章！查看全部</p>
            </div>
            <span className="text-2xl text-gray-300 ml-auto">›</span>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      <Modal isOpen={showSetup} onClose={() => !isFirstVisit && setShowSetup(false)} title="设置我的小档案">
        <div className="space-y-5">
          <div>
            <p className="font-bold text-gray-700 mb-2">你叫什么名字？</p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="输入你的名字..."
              maxLength={10}
              className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-lg font-bold text-gray-800 focus:outline-none focus:border-orange-400 bg-orange-50"
            />
          </div>
          <div>
            <p className="font-bold text-gray-700 mb-2">选一个头像</p>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-4xl py-2 rounded-2xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-orange-100 scale-110 border-2 border-orange-400'
                      : 'bg-gray-50 hover:bg-gray-100 active:scale-95'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSaveSetup}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
          >
            开始学习！🚀
          </button>
        </div>
      </Modal>
    </div>
  );
}
