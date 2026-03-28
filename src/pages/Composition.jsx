import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { pictureCompositions, vocabularyLessons, sentencePractice } from '../data/compositionData';
import Modal from '../components/Modal';

// --- Picture Composition ---
function CompositionCard({ comp, onStart }) {
  return (
    <button
      onClick={() => onStart(comp)}
      className="w-full bg-white rounded-3xl border-2 border-purple-100 p-4 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
          {comp.emoji}
        </div>
        <div className="text-left flex-1">
          <h3 className="font-black text-gray-800">{comp.title}</h3>
          <p className="text-xs text-gray-400">{comp.theme}</p>
          <span className="text-xs bg-purple-100 text-purple-500 rounded-full px-2 py-0.5 font-bold">+{comp.xp} XP</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {comp.pictures.map((pic, i) => (
          <div key={i} className="flex-shrink-0 bg-purple-50 rounded-xl px-3 py-2 text-center border border-purple-100">
            <div className="text-2xl">{pic.emoji}</div>
            <div className="text-xs text-gray-400 mt-0.5 w-16 leading-tight">{i + 1}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

function CompositionPractice({ comp, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [step, setStep] = useState('pictures'); // pictures, keywords, writing, model
  const [vocabIndex, setVocabIndex] = useState(0);
  const [essay, setEssay] = useState('');
  const [showModel, setShowModel] = useState(false);

  const handleComplete = () => {
    addXP(comp.xp, `comp-${comp.id}`);
    setStep('model');
  };

  if (step === 'pictures') return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-2xl p-3 border-2 border-purple-100 text-center">
        <p className="font-bold text-purple-600">{comp.emoji} {comp.title}</p>
        <p className="text-xs text-gray-500 mt-1">主题：{comp.theme}</p>
      </div>
      <p className="font-bold text-gray-700">📷 看图——这个故事讲什么？</p>
      <div className="space-y-3">
        {comp.pictures.map((pic, i) => (
          <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-4 flex items-center gap-3">
            <div className="text-4xl w-14 flex-shrink-0 text-center">{pic.emoji}</div>
            <div>
              <p className="text-xs text-gray-400 font-bold">图 {i + 1}</p>
              <p className="text-sm text-gray-700">{pic.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-yellow-50 rounded-2xl p-3 border-2 border-yellow-100">
        <p className="text-xs font-bold text-yellow-600 mb-1">💡 故事开头</p>
        {comp.storyStarters.map((s, i) => (
          <p key={i} className="text-xs text-gray-600">• {s}</p>
        ))}
      </div>
      <button
        onClick={() => setStep('keywords')}
        className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-black py-4 rounded-2xl shadow-lg"
      >
        学习关键词语 →
      </button>
    </div>
  );

  if (step === 'keywords') {
    const word = comp.keyWords[vocabIndex];
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-400">词语 {vocabIndex + 1} / {comp.keyWords.length}</div>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-6 text-center border-2 border-purple-100">
          <div className="text-4xl font-black text-gray-800 mb-1">{word.word}</div>
          <div className="text-purple-400 font-medium mb-3">{word.pinyin}</div>
          <div className="text-gray-600 text-sm bg-white rounded-xl px-4 py-2 inline-block">{word.meaning}</div>
        </div>
        <button
          onClick={() => speakChinese(word.word)}
          className="w-full bg-purple-100 text-purple-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          🔊 听发音
        </button>
        <div className="flex gap-3">
          {vocabIndex > 0 && (
            <button onClick={() => setVocabIndex(i => i - 1)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl">
              ← 上一个
            </button>
          )}
          {vocabIndex < comp.keyWords.length - 1 ? (
            <button onClick={() => setVocabIndex(i => i + 1)} className="flex-1 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-black py-3 rounded-2xl">
              下一个 →
            </button>
          ) : (
            <button onClick={() => setStep('writing')} className="flex-1 bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-3 rounded-2xl">
              开始写作！✍️
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'writing') return (
    <div className="space-y-4">
      <h3 className="font-black text-gray-800 text-lg">✍️ 写你的故事</h3>
      <div className="bg-yellow-50 rounded-2xl p-3 border-2 border-yellow-100">
        <p className="text-xs font-bold text-yellow-600 mb-2">💡 写作小贴士</p>
        {comp.tips.map((tip, i) => (
          <p key={i} className="text-xs text-gray-600">• {tip}</p>
        ))}
      </div>
      <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-100">
        <p className="text-xs font-bold text-blue-600 mb-1">常用短语</p>
        <div className="flex flex-wrap gap-1">
          {comp.usefulPhrases.map((p, i) => (
            <button
              key={i}
              onClick={() => setEssay(prev => prev + p)}
              className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 active:bg-blue-200"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder={`用"${comp.storyStarters[0]}"开始你的故事...\n\n记得写开头、中间和结尾！`}
        className="w-full h-48 bg-white border-2 border-purple-200 rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
      />
      <div className="text-right text-xs text-gray-400">{essay.length} 字</div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowModel(true)}
          className="flex-1 bg-yellow-100 text-yellow-700 font-bold py-3 rounded-2xl"
        >
          看范文 👁️
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-black py-3 rounded-2xl"
        >
          完成！+{comp.xp} XP
        </button>
      </div>

      {showModel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" style={{ maxWidth: '430px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-gray-800">📝 范文参考</h3>
              <button onClick={() => setShowModel(false)} className="text-gray-400">✕</button>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-100">
              <p className="text-sm text-gray-700 leading-loose whitespace-pre-line">{comp.modelComposition}</p>
            </div>
            <button
              onClick={() => speakChinese(comp.modelComposition, 0.8)}
              className="w-full mt-3 bg-green-100 text-green-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              🔊 听范文
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="text-center space-y-4 py-4">
      <div className="text-6xl">🎊</div>
      <h3 className="text-2xl font-black text-gray-800">写得太好了！</h3>
      <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
        <p className="font-black text-2xl text-yellow-600">+{comp.xp} XP ⭐</p>
      </div>
      <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-100 text-left">
        <p className="font-bold text-green-600 mb-2">查看范文</p>
        <p className="text-xs text-gray-700 leading-loose line-clamp-4">{comp.modelComposition}</p>
        <button
          onClick={() => speakChinese(comp.modelComposition, 0.8)}
          className="mt-2 bg-green-100 text-green-600 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1"
        >
          🔊 听范文
        </button>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white font-black py-4 rounded-2xl">
        继续练习 →
      </button>
    </div>
  );
}

// --- Vocabulary Lesson ---
function VocabLesson({ lesson, onStart }) {
  return (
    <button
      onClick={() => onStart(lesson)}
      className="w-full bg-white rounded-3xl border-2 border-blue-100 p-4 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl">{lesson.emoji}</div>
        <div className="text-left flex-1">
          <h3 className="font-black text-gray-800">{lesson.title}</h3>
          <p className="text-xs text-gray-400">{lesson.titleEn}</p>
          <span className="text-xs bg-blue-100 text-blue-500 rounded-full px-2 py-0.5 font-bold">+{lesson.xp} XP · {lesson.words.length}个词语</span>
        </div>
        <span className="text-2xl text-gray-200">›</span>
      </div>
    </button>
  );
}

function VocabPractice({ lesson, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState('learn'); // learn, quiz
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const word = lesson.words[index];

  const handleNext = () => {
    if (index < lesson.words.length - 1) {
      setIndex(i => i + 1);
      setQuizAnswer('');
      setQuizResult(null);
    } else {
      addXP(lesson.xp, `vocab-${lesson.id}`);
      setDone(true);
    }
  };

  const checkAnswer = () => {
    const correct = quizAnswer.trim() === word.word;
    setQuizResult(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  };

  if (done) return (
    <div className="text-center space-y-4 py-4">
      <div className="text-6xl">{score >= lesson.words.length * 0.8 ? '🌟' : '💪'}</div>
      <h3 className="text-2xl font-black text-gray-800">
        {score >= lesson.words.length * 0.8 ? '学得很好！' : '继续加油！'}
      </h3>
      <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
        <p className="text-blue-600 font-black text-xl">+{lesson.xp} XP</p>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-black py-4 rounded-2xl">
        完成 ✓
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">词语 {index + 1} / {lesson.words.length}</div>
        <div className="flex gap-2">
          <button onClick={() => setMode('learn')} className={`text-xs px-3 py-1 rounded-full font-bold ${mode === 'learn' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>学习</button>
          <button onClick={() => setMode('quiz')} className={`text-xs px-3 py-1 rounded-full font-bold ${mode === 'quiz' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>测试</button>
        </div>
      </div>

      {mode === 'learn' ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 text-center border-2 border-blue-100">
            <div className="text-5xl mb-2">{word.emoji}</div>
            <div className="text-4xl font-black text-gray-800 mb-1">{word.word}</div>
            <div className="text-blue-400 font-medium mb-2">{word.pinyin}</div>
            <div className="text-gray-600 text-sm bg-white rounded-xl px-4 py-2 inline-block">{word.meaning}</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-100">
            <p className="text-xs font-bold text-yellow-600 mb-1">例句</p>
            <p className="text-sm text-gray-700">{word.example}</p>
            <button
              onClick={() => speakChinese(word.example, 0.8)}
              className="mt-2 bg-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
            >
              🔊 听例句
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-purple-50 rounded-3xl p-6 text-center border-2 border-purple-100">
            <div className="text-5xl mb-2">{word.emoji}</div>
            <p className="text-gray-600 text-sm bg-white rounded-xl px-4 py-2 inline-block">{word.meaning}</p>
            <p className="text-purple-400 font-medium mt-2">{word.pinyin}</p>
            <p className="text-xs text-gray-400 mt-1">猜猜这个词语怎么写？</p>
          </div>
          <input
            type="text"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            placeholder="写下这个词语..."
            className={`w-full border-2 rounded-2xl px-4 py-3 text-lg font-bold text-center focus:outline-none ${
              quizResult === 'correct' ? 'border-green-400 bg-green-50 text-green-700' :
              quizResult === 'wrong' ? 'border-red-400 bg-red-50 text-red-700' :
              'border-purple-200 focus:border-purple-400'
            }`}
          />
          {quizResult === 'wrong' && (
            <div className="text-center text-sm text-red-600 font-bold">
              正确答案：<span className="text-gray-800">{word.word}</span>
            </div>
          )}
          {!quizResult && (
            <button
              onClick={checkAnswer}
              disabled={!quizAnswer.trim()}
              className="w-full bg-purple-500 text-white font-black py-3 rounded-2xl disabled:opacity-50"
            >
              检查答案
            </button>
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-black py-3 rounded-2xl"
      >
        {index < lesson.words.length - 1 ? '下一个词语 →' : '完成！🎉'}
      </button>
    </div>
  );
}

// --- Sentence Practice ---
function SentencePracticeCard({ practice, onStart }) {
  return (
    <button
      onClick={() => onStart(practice)}
      className="w-full bg-white rounded-3xl border-2 border-green-100 p-4 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl">{practice.emoji}</div>
        <div className="text-left flex-1">
          <h3 className="font-black text-gray-800 text-sm">{practice.title}</h3>
          <div className="bg-green-100 text-green-700 text-xs font-bold rounded-lg px-2 py-0.5 mt-1 inline-block">
            {practice.pattern}
          </div>
          <span className="block text-xs text-gray-400 mt-0.5">+{practice.xp} XP</span>
        </div>
        <span className="text-2xl text-gray-200">›</span>
      </div>
    </button>
  );
}

function SentencePracticeModal({ practice, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const current = practice.prompts[index];

  const handleNext = () => {
    if (index < practice.prompts.length - 1) {
      setIndex(i => i + 1);
    } else {
      addXP(practice.xp, `sentence-${practice.id}`);
      setDone(true);
    }
  };

  if (done) return (
    <div className="text-center space-y-4 py-4">
      <div className="text-6xl">🌟</div>
      <h3 className="text-2xl font-black text-gray-800">造句高手！</h3>
      <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-100">
        <p className="font-black text-2xl text-green-600">+{practice.xp} XP</p>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl">
        完成 ✓
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100 text-center">
        <p className="text-sm font-bold text-green-700">句型：{practice.pattern}</p>
      </div>
      <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-100">
        <p className="text-xs font-bold text-blue-600 mb-2">例句</p>
        {practice.examples.map((ex, i) => (
          <div key={i} className="flex items-start gap-2 mb-1">
            <span className="text-blue-400 text-xs mt-0.5">•</span>
            <p className="text-sm text-gray-700 flex-1">{ex}</p>
            <button
              onClick={() => speakChinese(ex)}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0"
            >
              🔊
            </button>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400 text-center">题目 {index + 1} / {practice.prompts.length}</div>

      <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-100">
        <p className="text-xs font-bold text-yellow-600 mb-1">提示词</p>
        <p className="text-sm text-gray-700 font-medium">{current.context}</p>
        <p className="text-xs text-gray-500 mt-2 italic">{current.hint}</p>
      </div>

      <textarea
        value={answers[index] || ''}
        onChange={(e) => setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
        placeholder={`用"${practice.pattern}"造一个句子...`}
        className="w-full h-24 bg-white border-2 border-green-200 rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:border-green-400 resize-none"
      />

      {answers[index] && (
        <button
          onClick={() => speakChinese(answers[index])}
          className="w-full bg-green-100 text-green-600 font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 text-sm"
        >
          🔊 听自己的句子
        </button>
      )}

      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl"
      >
        {index < practice.prompts.length - 1 ? '下一题 →' : '完成！🎉'}
      </button>
    </div>
  );
}

// --- Main Page ---
export default function Composition() {
  const [activeTab, setActiveTab] = useState('composition');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { completeActivity } = useGame();

  const tabs = [
    { id: 'composition', label: '看图作文', emoji: '🖼️' },
    { id: 'vocab', label: '词语学习', emoji: '📚' },
    { id: 'sentence', label: '句子造句', emoji: '✏️' },
  ];

  const handleStart = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const getModalTitle = () => {
    if (!selectedItem) return '';
    return selectedItem.title;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      <div className="bg-gradient-to-br from-purple-500 to-blue-500 pt-12 pb-6 px-5">
        <h1 className="text-white text-2xl font-black">✍️ 作文练习</h1>
        <p className="text-purple-100 text-sm mt-1">P4 华文作文 · 妙笔生花！</p>
      </div>

      <div className="px-5 mt-4">
        <div className="flex gap-2 bg-purple-50 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all font-bold text-xs ${
                activeTab === tab.id ? 'bg-white text-purple-500 shadow-sm' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'composition' && (
          <>
            <div className="bg-purple-50 rounded-2xl p-3 border-2 border-purple-100">
              <p className="text-sm font-bold text-purple-600">💡 看图作文小贴士</p>
              <p className="text-xs text-gray-600 mt-1">仔细看每一幅图，想想故事的来龙去脉，再动手写！</p>
            </div>
            {pictureCompositions.map(comp => (
              <CompositionCard key={comp.id} comp={comp} onStart={handleStart} />
            ))}
          </>
        )}
        {activeTab === 'vocab' && (
          <>
            <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-100">
              <p className="text-sm font-bold text-blue-600">💡 词语学习小贴士</p>
              <p className="text-xs text-gray-600 mt-1">先学习词语，再用"测试"模式检验自己！</p>
            </div>
            {vocabularyLessons.map(lesson => (
              <VocabLesson key={lesson.id} lesson={lesson} onStart={handleStart} />
            ))}
          </>
        )}
        {activeTab === 'sentence' && (
          <>
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100">
              <p className="text-sm font-bold text-green-600">💡 造句小贴士</p>
              <p className="text-xs text-gray-600 mt-1">用给出的句型和提示词，自己造一个完整的句子！</p>
            </div>
            {sentencePractice.map(p => (
              <SentencePracticeCard key={p.id} practice={p} onStart={handleStart} />
            ))}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={getModalTitle()}>
        {selectedItem && activeTab === 'composition' && (
          <CompositionPractice comp={selectedItem} onClose={() => { setModalOpen(false); completeActivity('composition', 0); }} />
        )}
        {selectedItem && activeTab === 'vocab' && (
          <VocabPractice lesson={selectedItem} onClose={() => setModalOpen(false)} />
        )}
        {selectedItem && activeTab === 'sentence' && (
          <SentencePracticeModal practice={selectedItem} onClose={() => setModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
