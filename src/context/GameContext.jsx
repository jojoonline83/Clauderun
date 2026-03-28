import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

const BADGES = [
  { id: 'first_step', name: '初学乍练', nameEn: 'First Steps', emoji: '🌟', desc: '完成第一个练习', condition: (s) => s.totalXP >= 10 },
  { id: 'oral_master', name: '口若悬河', nameEn: 'Speaking Star', emoji: '🎤', desc: '完成5个口语练习', condition: (s) => s.oralCompleted >= 5 },
  { id: 'writer', name: '妙笔生花', nameEn: 'Writing Wizard', emoji: '✍️', desc: '完成3篇作文练习', condition: (s) => s.compositionCompleted >= 3 },
  { id: 'listener', name: '洗耳恭听', nameEn: 'Listening Legend', emoji: '👂', desc: '完成5个听力练习', condition: (s) => s.listeningCompleted >= 5 },
  { id: 'streak_3', name: '三天打鱼', nameEn: '3-Day Streak', emoji: '🔥', desc: '连续练习3天', condition: (s) => s.streak >= 3 },
  { id: 'xp_100', name: '百分努力', nameEn: 'Century Scorer', emoji: '💯', desc: '累积100 XP', condition: (s) => s.totalXP >= 100 },
  { id: 'xp_500', name: '学海无涯', nameEn: 'XP Champion', emoji: '🏆', desc: '累积500 XP', condition: (s) => s.totalXP >= 500 },
  { id: 'perfect', name: '十全十美', nameEn: 'Perfectionist', emoji: '💎', desc: '满分完成一个练习', condition: (s) => s.perfectScores >= 1 },
];

const LEVELS = [
  { level: 1, name: '小学生', minXP: 0, maxXP: 50, emoji: '🐣' },
  { level: 2, name: '认字能手', minXP: 50, maxXP: 150, emoji: '🐥' },
  { level: 3, name: '小小诗人', minXP: 150, maxXP: 300, emoji: '🐦' },
  { level: 4, name: '作文达人', minXP: 300, maxXP: 500, emoji: '🦜' },
  { level: 5, name: '华文高手', minXP: 500, maxXP: 800, emoji: '🦅' },
  { level: 6, name: '文学大师', minXP: 800, maxXP: 99999, emoji: '🌟' },
];

const defaultStats = {
  totalXP: 0,
  oralCompleted: 0,
  compositionCompleted: 0,
  listeningCompleted: 0,
  streak: 0,
  lastPlayedDate: null,
  perfectScores: 0,
  earnedBadges: [],
  completedActivities: [],
  name: '小朋友',
  avatar: '🐼',
};

export function GameProvider({ children }) {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('chineseAppStats');
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch { return defaultStats; }
  });

  const [notification, setNotification] = useState(null);
  const [xpAnimation, setXpAnimation] = useState(null);

  useEffect(() => {
    localStorage.setItem('chineseAppStats', JSON.stringify(stats));
  }, [stats]);

  const getCurrentLevel = () => {
    return [...LEVELS].reverse().find(l => stats.totalXP >= l.minXP) || LEVELS[0];
  };

  const getNextLevel = () => {
    const current = getCurrentLevel();
    return LEVELS.find(l => l.level === current.level + 1) || null;
  };

  const getLevelProgress = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    const range = next.minXP - current.minXP;
    const progress = stats.totalXP - current.minXP;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  const addXP = (amount, activityId = null) => {
    setXpAnimation({ amount, id: Date.now() });
    setTimeout(() => setXpAnimation(null), 2000);

    setStats(prev => {
      const newStats = {
        ...prev,
        totalXP: prev.totalXP + amount,
        completedActivities: activityId
          ? [...new Set([...prev.completedActivities, activityId])]
          : prev.completedActivities,
      };

      // Check for new badges
      const newBadges = BADGES.filter(b =>
        !prev.earnedBadges.includes(b.id) && b.condition(newStats)
      );

      if (newBadges.length > 0) {
        setTimeout(() => {
          setNotification({
            type: 'badge',
            badge: newBadges[0],
          });
          setTimeout(() => setNotification(null), 3500);
        }, 500);
        newStats.earnedBadges = [...prev.earnedBadges, ...newBadges.map(b => b.id)];
      }

      return newStats;
    });
  };

  const completeActivity = (type, xp, isPerfect = false) => {
    setStats(prev => ({
      ...prev,
      totalXP: prev.totalXP + xp,
      oralCompleted: type === 'oral' ? prev.oralCompleted + 1 : prev.oralCompleted,
      compositionCompleted: type === 'composition' ? prev.compositionCompleted + 1 : prev.compositionCompleted,
      listeningCompleted: type === 'listening' ? prev.listeningCompleted + 1 : prev.listeningCompleted,
      perfectScores: isPerfect ? prev.perfectScores + 1 : prev.perfectScores,
    }));
  };

  const showMessage = (msg) => {
    setNotification({ type: 'message', text: msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateName = (name) => setStats(prev => ({ ...prev, name }));
  const updateAvatar = (avatar) => setStats(prev => ({ ...prev, avatar }));

  const isActivityCompleted = (id) => stats.completedActivities.includes(id);

  const speakChinese = (text, rate = 0.9) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = rate;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <GameContext.Provider value={{
      stats, addXP, completeActivity, showMessage, notification,
      xpAnimation, getCurrentLevel, getNextLevel, getLevelProgress,
      BADGES, LEVELS, updateName, updateAvatar, isActivityCompleted,
      speakChinese,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
