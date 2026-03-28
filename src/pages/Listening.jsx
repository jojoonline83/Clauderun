import { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { listeningStories, dictationWords } from '../data/listeningData';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

// --- Story Card ---
function StoryCard({ story, onStart }) {
  return (
    <button
      onClick={() => onStart(story)}
      className="w-full bg-white rounded-3xl border-2 border-green-100 p-4 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
          {story.emoji}
        </div>
        <div className="text-left flex-1">
          <h3 className="font-black text-gray-800">{story.title}</h3>
          <p className="text-xs text-gray-400">{story.theme} · {story.duration}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 font-bold">+{story.xp} XP</span>
            <span className="text-xs text-gray-400">{story.questions.length} 道题</span>
          </div>
        </div>
        <span className="text-2xl text-gray-200">›</span>
      </div>
    </button>
  );
}

function StoryPractice({ story, onClose }) {
  const { speakChinese, addXP, completeActivity } = useGame();
  const [step, setStep] = useState('listen'); // listen, questions, results
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paragraphIndex, setParagraphIndex] = useState(-1);

  const paragraphs = story.story.split('\n\n').filter(p => p.trim());

  const playStory = () => {
    setIsPlaying(true);
    setParagraphIndex(0);
    speakChinese(story.story, 0.85);
    const estimatedDuration = story.story.length * 120;
    setTimeout(() => {
      setIsPlaying(false);
      setParagraphIndex(-1);
    }, estimatedDuration);
  };

  const stopStory = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setParagraphIndex(-1);
  };

  const handleSubmit = () => {
    const scored = story.questions.map((q, i) => ({
      ...q,
      userAnswer: answers[i] ?? -1,
      correct: answers[i] === q.answer,
    }));
    const score = scored.filter(q => q.correct).length;
    const isPerfect = score === story.questions.length;
    addXP(story.xp, `story-${story.id}`);
    completeActivity('listening', 0, isPerfect);
    setResults({ scored, score });
    setStep('results');
  };

  if (step === 'listen') return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">{story.emoji}</div>
        <h3 className="font-black text-gray-800 text-lg">{story.title}</h3>
        <p className="text-xs text-gray-400">主题：{story.theme}</p>
      </div>

      {/* Story text with animation */}
      <div className={`bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-5 border-2 border-green-100 ${isPlaying ? 'animate-pulse' : ''}`}>
        {paragraphs.map((para, i) => (
          <p key={i} className={`text-sm text-gray-700 leading-loose mb-3 last:mb-0 transition-all duration-300 ${
            isPlaying && paragraphIndex === i ? 'bg-yellow-100 rounded-lg px-2 -mx-2' : ''
          }`}>
            {para}
          </p>
        ))}
      </div>

      <div className="flex gap-3">
        {!isPlaying ? (
          <button
            onClick={playStory}
            className="flex-1 bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            🔊 听故事
          </button>
        ) : (
          <button
            onClick={stopStory}
            className="flex-1 bg-red-100 text-red-500 font-black py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            ⏹ 停止
          </button>
        )}
      </div>

      <button
        onClick={() => setStep('questions')}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl shadow-lg"
      >
        回答问题 →
      </button>
    </div>
  );

  if (step === 'questions') return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100 flex justify-between items-center">
        <p className="text-sm font-bold text-green-600">📝 阅读理解</p>
        <button
          onClick={() => speakChinese(story.story, 0.85)}
          className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold"
        >
          🔊 再听一次
        </button>
      </div>
      {story.questions.map((q, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="font-bold text-gray-800 text-sm mb-3">{i + 1}. {q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => setAnswers(prev => ({ ...prev, [i]: j }))}
                className={`w-full text-left text-sm px-4 py-3 rounded-xl border-2 transition-all ${
                  answers[i] === j
                    ? 'border-green-400 bg-green-50 text-green-700 font-bold'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                {String.fromCharCode(65 + j)}. {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < story.questions.length}
        className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-50"
      >
        提交答案 ({Object.keys(answers).length}/{story.questions.length})
      </button>
    </div>
  );

  // Results
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">
          {results.score === story.questions.length ? '🌟' : results.score >= story.questions.length * 0.7 ? '😊' : '💪'}
        </div>
        <h3 className="text-xl font-black text-gray-800">
          {results.score === story.questions.length ? '全对！太厉害了！' :
           results.score >= story.questions.length * 0.7 ? '不错！继续加油！' : '别气馁！再试一次！'}
        </h3>
        <div className="mt-2">
          <StarRating score={results.score} total={story.questions.length} size="lg" />
          <p className="text-gray-500 text-sm mt-1">{results.score} / {story.questions.length} 正确</p>
        </div>
      </div>

      {results.scored.map((q, i) => (
        <div key={i} className={`rounded-2xl border-2 p-4 ${q.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{q.correct ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">{i + 1}. {q.q}</p>
              {!q.correct && (
                <>
                  <p className="text-xs text-red-600 mt-1">你的答案：{q.options[q.userAnswer] || '未作答'}</p>
                  <p className="text-xs text-green-700 font-bold">正确答案：{q.options[q.answer]}</p>
                </>
              )}
              <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200 text-center">
        <p className="font-black text-yellow-600 text-xl">+{story.xp} XP ⭐</p>
      </div>

      <button onClick={onClose} className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl">
        继续练习 →
      </button>
    </div>
  );
}

// --- Dictation ---
function DictationCard({ dictation, onStart }) {
  return (
    <button
      onClick={() => onStart(dictation)}
      className="w-full bg-white rounded-3xl border-2 border-blue-100 p-4 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl">{dictation.emoji}</div>
        <div className="text-left flex-1">
          <h3 className="font-black text-gray-800">{dictation.title}</h3>
          <p className="text-xs text-gray-400">{dictation.words.length} 个词语</p>
          <span className="text-xs bg-blue-100 text-blue-500 rounded-full px-2 py-0.5 font-bold">+{dictation.xp} XP</span>
        </div>
        <span className="text-2xl text-gray-200">›</span>
      </div>
    </button>
  );
}

function DictationPractice({ dictation, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const word = dictation.words[index];
  const isCorrect = input.trim() === word.word;

  const handleCheck = () => {
    setChecked(true);
    setResults(prev => [...prev, { word: word.word, userInput: input.trim(), correct: isCorrect, pinyin: word.pinyin }]);
  };

  const handleNext = () => {
    if (index < dictation.words.length - 1) {
      setIndex(i => i + 1);
      setInput('');
      setChecked(false);
    } else {
      addXP(dictation.xp, `dict-${dictation.id}`);
      setDone(true);
    }
  };

  if (done) {
    const correctCount = results.filter(r => r.correct).length;
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-2">{correctCount >= dictation.words.length * 0.8 ? '🌟' : '💪'}</div>
          <h3 className="text-xl font-black text-gray-800">
            {correctCount === dictation.words.length ? '满分！' : '写完了！'}
          </h3>
          <StarRating score={correctCount} total={dictation.words.length} size="lg" />
          <p className="text-gray-500 text-sm mt-1">{correctCount} / {dictation.words.length} 正确</p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl"
        >
          {showAll ? '收起' : '查看结果'}
        </button>
        {showAll && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 ${r.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div>
                  <span className="font-black text-gray-800">{r.word}</span>
                  <span className="text-xs text-gray-400 ml-2">{r.pinyin}</span>
                  {!r.correct && <p className="text-xs text-red-500">你写了：{r.userInput || '（空白）'}</p>}
                </div>
                <span className="text-lg">{r.correct ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200 text-center">
          <p className="font-black text-yellow-600 text-xl">+{dictation.xp} XP ⭐</p>
        </div>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-black py-4 rounded-2xl">
          完成 ✓
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-400">词语 {index + 1} / {dictation.words.length}</div>

      <div className="bg-blue-50 rounded-3xl p-6 text-center border-2 border-blue-100">
        <p className="text-xs text-gray-400 mb-3">听发音，写出词语</p>
        <button
          onClick={() => speakChinese(word.word)}
          className="bg-blue-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 mx-auto"
        >
          <span className="text-2xl">🔊</span> 听发音
        </button>
        <p className="text-blue-400 font-medium mt-3">{word.pinyin}</p>
        <p className="text-gray-500 text-sm mt-1">{word.meaning}</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => !checked && setInput(e.target.value)}
          placeholder="写下这个词语..."
          className={`w-full border-2 rounded-2xl px-4 py-4 text-2xl font-black text-center focus:outline-none transition-all ${
            checked
              ? isCorrect
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-red-400 bg-red-50 text-red-700'
              : 'border-blue-200 focus:border-blue-400'
          }`}
        />
        {checked && (
          <div className="mt-2 text-center">
            {isCorrect
              ? <p className="text-green-600 font-bold">✅ 正确！太棒了！</p>
              : <p className="text-red-600 font-bold">❌ 正确是：<span className="text-2xl">{word.word}</span></p>
            }
          </div>
        )}
      </div>

      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl disabled:opacity-50"
        >
          检查
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-black py-4 rounded-2xl"
        >
          {index < dictation.words.length - 1 ? '下一个 →' : '完成！🎉'}
        </button>
      )}
    </div>
  );
}

// --- Main Page ---
export default function Listening() {
  const [activeTab, setActiveTab] = useState('story');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const tabs = [
    { id: 'story', label: '听故事', emoji: '📖' },
    { id: 'dictation', label: '词语听写', emoji: '✏️' },
  ];

  const handleStart = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      <div className="bg-gradient-to-br from-green-500 to-teal-500 pt-12 pb-6 px-5">
        <h1 className="text-white text-2xl font-black">👂 听力练习</h1>
        <p className="text-green-100 text-sm mt-1">P4 华文听力 · 认真聆听！</p>
      </div>

      <div className="px-5 mt-4">
        <div className="flex gap-2 bg-green-50 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all font-bold text-xs ${
                activeTab === tab.id ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'story' && (
          <>
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100">
              <p className="text-sm font-bold text-green-600">💡 怎么练习？</p>
              <p className="text-xs text-gray-600 mt-1">先仔细听故事，再回答选择题。可以听多几次哦！</p>
            </div>
            {listeningStories.map(story => (
              <StoryCard key={story.id} story={story} onStart={handleStart} />
            ))}
          </>
        )}
        {activeTab === 'dictation' && (
          <>
            <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-100">
              <p className="text-sm font-bold text-blue-600">💡 词语听写</p>
              <p className="text-xs text-gray-600 mt-1">听词语的发音，然后写出正确的汉字！</p>
            </div>
            {dictationWords.map(d => (
              <DictationCard key={d.id} dictation={d} onStart={handleStart} />
            ))}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedItem?.title}>
        {selectedItem && activeTab === 'story' && (
          <StoryPractice story={selectedItem} onClose={() => setModalOpen(false)} />
        )}
        {selectedItem && activeTab === 'dictation' && (
          <DictationPractice dictation={selectedItem} onClose={() => setModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
