import { useGame } from '../context/GameContext';

const mascotMoods = {
  happy: { face: '😄', speech: '你好棒！继续加油！' },
  excited: { face: '🤩', speech: '太厉害了！你真的很努力！' },
  encourage: { face: '😊', speech: '加油！你一定可以的！' },
  celebrate: { face: '🥳', speech: '哇！恭喜你！厉害！' },
  neutral: { face: '😌', speech: '我们一起学华文吧！' },
  thinking: { face: '🤔', speech: '想一想，你一定行的！' },
};

export default function Mascot({ mood = 'happy', size = 'md', speech, showSpeech = false }) {
  const { stats } = useGame();
  const currentMood = mascotMoods[mood] || mascotMoods.happy;
  const displaySpeech = speech || currentMood.speech;

  const sizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  };

  return (
    <div className="flex flex-col items-center">
      {showSpeech && (
        <div className="relative mb-2 animate-fade-in">
          <div className="bg-white border-2 border-orange-200 rounded-2xl px-4 py-2 shadow-md max-w-[200px] text-center">
            <p className="text-sm font-bold text-gray-700">{displaySpeech}</p>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-orange-200 rotate-45 z-10" />
        </div>
      )}
      <div className={`${sizes[size]} animate-float select-none`}>
        {stats.avatar || '🐼'}
      </div>
    </div>
  );
}
