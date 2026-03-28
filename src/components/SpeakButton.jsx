import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function SpeakButton({ text, label = '听发音', size = 'md', className = '' }) {
  const { speakChinese } = useGame();
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    setSpeaking(true);
    speakChinese(text);
    setTimeout(() => setSpeaking(false), 2000);
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={handleSpeak}
      className={`
        flex items-center gap-2 rounded-2xl font-bold transition-all active:scale-95
        ${speaking
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
        }
        ${sizes[size]} ${className}
      `}
    >
      <span className={speaking ? 'animate-pulse' : ''}>🔊</span>
      <span>{label}</span>
    </button>
  );
}
