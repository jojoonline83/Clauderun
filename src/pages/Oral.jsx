import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { oralTopics, readingPassages, conversations } from '../data/oralTopics';
import Modal from '../components/Modal';
import SpeakButton from '../components/SpeakButton';
import StarRating from '../components/StarRating';

// --- Picture Topic Card ---
function PictureTopicCard({ topic, onStart }) {
  return (
    <button
      onClick={() => onStart(topic)}
      className="w-full bg-white rounded-3xl border-2 border-orange-100 p-4 flex items-center gap-3 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
        {topic.emoji}
      </div>
      <div className="text-left flex-1">
        <h3 className="font-black text-gray-800">{topic.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{topic.titleEn}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-orange-100 text-orange-500 rounded-full px-2 py-0.5 font-bold">
            +{topic.xp} XP
          </span>
          <span className="text-xs text-gray-400">{'⭐'.repeat(topic.difficulty)}</span>
        </div>
      </div>
      <span className="text-2xl text-gray-200">›</span>
    </button>
  );
}

// --- Picture Topic Practice ---
function PictureTopicPractice({ topic, onClose, onComplete }) {
  const { speakChinese, addXP } = useGame();
  const [step, setStep] = useState('intro'); // intro, vocab, questions, model, done
  const [vocabIndex, setVocabIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState([]);

  const handleComplete = () => {
    addXP(topic.xp, `oral-topic-${topic.id}`);
    onComplete();
    setStep('done');
  };

  if (step === 'intro') return (
    <div className="space-y-4">
      <div className="text-center text-6xl mb-2">{topic.emoji}</div>
      <div className="bg-orange-50 rounded-2xl p-4">
        <p className="text-sm font-bold text-orange-600 mb-2">📖 题目情景</p>
        <p className="text-gray-700 leading-relaxed">{topic.scene}</p>
        <p className="text-xs text-gray-400 mt-2 italic">{topic.sceneEn}</p>
      </div>
      <button
        onClick={() => speakChinese(topic.scene)}
        className="w-full bg-orange-100 text-orange-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
      >
        🔊 听一听
      </button>
      <button
        onClick={() => setStep('vocab')}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200"
      >
        学习词汇 →
      </button>
    </div>
  );

  if (step === 'vocab') {
    const word = topic.vocabulary[vocabIndex];
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-400">词汇 {vocabIndex + 1} / {topic.vocabulary.length}</div>
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-6 text-center border-2 border-orange-100">
          <div className="text-4xl font-black text-gray-800 mb-1">{word.word}</div>
          <div className="text-orange-400 font-medium mb-3">{word.pinyin}</div>
          <div className="text-gray-600 text-sm bg-white rounded-xl px-4 py-2 inline-block">{word.meaning}</div>
        </div>
        <button
          onClick={() => speakChinese(word.word)}
          className="w-full bg-orange-100 text-orange-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          🔊 听发音
        </button>
        <div className="flex gap-3">
          {vocabIndex > 0 && (
            <button
              onClick={() => setVocabIndex(i => i - 1)}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl"
            >
              ← 上一个
            </button>
          )}
          {vocabIndex < topic.vocabulary.length - 1 ? (
            <button
              onClick={() => setVocabIndex(i => i + 1)}
              className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-3 rounded-2xl"
            >
              下一个 →
            </button>
          ) : (
            <button
              onClick={() => setStep('questions')}
              className="flex-1 bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-3 rounded-2xl"
            >
              回答问题！🎤
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    const question = topic.questions[questionIndex];
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-400">问题 {questionIndex + 1} / {topic.questions.length}</div>
        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
          <p className="text-sm font-bold text-blue-600 mb-1">🤔 口语问题</p>
          <p className="text-gray-800 font-bold text-lg">{question}</p>
        </div>
        <button
          onClick={() => speakChinese(question)}
          className="w-full bg-blue-100 text-blue-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          🔊 听问题
        </button>
        <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-100">
          <p className="text-sm font-bold text-yellow-600 mb-2">💡 回答提示</p>
          <p className="text-xs text-gray-600">用完整的句子回答，记得用上刚才学的词汇！</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {topic.vocabulary.slice(0, 3).map(v => (
              <span key={v.word} className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">{v.word}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {questionIndex < topic.questions.length - 1 ? (
            <button
              onClick={() => setQuestionIndex(i => i + 1)}
              className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-3 rounded-2xl"
            >
              下一题 →
            </button>
          ) : (
            <button
              onClick={() => setStep('model')}
              className="flex-1 bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-3 rounded-2xl"
            >
              查看参考答案 ✨
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'model') return (
    <div className="space-y-4">
      <div className="text-center text-4xl">🌟</div>
      <h3 className="text-center font-black text-gray-800 text-lg">参考答案</h3>
      <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-100">
        <p className="text-gray-700 leading-relaxed text-sm">{topic.modelAnswer}</p>
      </div>
      <button
        onClick={() => speakChinese(topic.modelAnswer, 0.8)}
        className="w-full bg-green-100 text-green-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
      >
        🔊 听示范
      </button>
      <div className="bg-orange-50 rounded-2xl p-3 border-2 border-orange-100">
        <p className="text-center font-bold text-orange-600">{topic.encouragement}</p>
      </div>
      <button
        onClick={handleComplete}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200"
      >
        完成练习 🎉 +{topic.xp} XP
      </button>
    </div>
  );

  if (step === 'done') return (
    <div className="text-center space-y-4 py-4">
      <div className="text-6xl animate-bounce-slow">🎊</div>
      <h3 className="text-2xl font-black text-gray-800">太棒了！</h3>
      <p className="text-gray-500">你已经完成了这道口语题！</p>
      <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
        <p className="font-black text-2xl text-yellow-600">+{topic.xp} XP ⭐</p>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl">
        继续练习 →
      </button>
    </div>
  );
}

// --- Reading Practice ---
function ReadingCard({ passage, onStart }) {
  return (
    <button
      onClick={() => onStart(passage)}
      className="w-full bg-white rounded-3xl border-2 border-blue-100 p-4 flex items-center gap-3 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
        {passage.emoji}
      </div>
      <div className="text-left flex-1">
        <h3 className="font-black text-gray-800">{passage.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{passage.titleEn}</p>
        <span className="text-xs bg-blue-100 text-blue-500 rounded-full px-2 py-0.5 font-bold mt-1 inline-block">
          +{passage.xp} XP
        </span>
      </div>
      <span className="text-2xl text-gray-200">›</span>
    </button>
  );
}

function ReadingPractice({ passage, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [step, setStep] = useState('read');
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleCheck = () => {
    addXP(passage.xp, `reading-${passage.id}`);
    setShowResults(true);
    setStep('results');
  };

  if (step === 'read') return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-5 border-2 border-blue-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-black text-gray-800">{passage.title}</h3>
          <button
            onClick={() => speakChinese(passage.content, 0.8)}
            className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1"
          >
            🔊 朗读
          </button>
        </div>
        <p className="text-gray-700 leading-loose text-sm">
          {passage.content.split('').map((char, i) => (
            <span
              key={i}
              className={passage.highlight?.some(h => passage.content.slice(i, i + h.length) === h)
                ? 'bg-yellow-200 rounded px-0.5' : ''}
            >
              {char}
            </span>
          ))}
        </p>
      </div>
      <div className="bg-yellow-50 rounded-2xl p-3 border-2 border-yellow-100">
        <p className="text-xs font-bold text-yellow-600 mb-2">📌 重点词语（已高亮）</p>
        <div className="flex flex-wrap gap-2">
          {passage.highlight?.map(w => (
            <span key={w} className="text-xs bg-yellow-200 text-yellow-800 rounded-full px-2 py-0.5 font-bold">{w}</span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setStep('questions')}
        className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-black py-4 rounded-2xl shadow-lg"
      >
        回答问题 →
      </button>
    </div>
  );

  if (step === 'questions') return (
    <div className="space-y-4">
      <h3 className="font-black text-gray-800">阅读理解</h3>
      {passage.questions.map((q, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="font-bold text-gray-800 text-sm mb-2">{i + 1}. {q.q}</p>
          <input
            type="text"
            placeholder="写下你的答案..."
            value={answers[i] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-300"
          />
        </div>
      ))}
      <button
        onClick={handleCheck}
        className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl shadow-lg"
      >
        查看答案 ✨
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center text-4xl">🌟</div>
      <h3 className="text-center font-black text-gray-800">参考答案</h3>
      {passage.questions.map((q, i) => (
        <div key={i} className="bg-green-50 rounded-2xl border-2 border-green-100 p-4">
          <p className="text-xs font-bold text-gray-500 mb-1">{q.q}</p>
          <p className="font-bold text-green-700 text-sm">{q.a}</p>
        </div>
      ))}
      <button onClick={onClose} className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl">
        完成 +{passage.xp} XP 🎉
      </button>
    </div>
  );
}

// --- Conversation Practice ---
function ConversationCard({ conv, onStart }) {
  return (
    <button
      onClick={() => onStart(conv)}
      className="w-full bg-white rounded-3xl border-2 border-green-100 p-4 flex items-center gap-3 active:scale-[0.98] transition-all shadow-sm"
    >
      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
        {conv.emoji}
      </div>
      <div className="text-left flex-1">
        <h3 className="font-black text-gray-800">{conv.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{conv.scenario}</p>
        <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 font-bold mt-1 inline-block">
          +{conv.xp} XP
        </span>
      </div>
      <span className="text-2xl text-gray-200">›</span>
    </button>
  );
}

function ConversationPractice({ conv, onClose }) {
  const { speakChinese, addXP } = useGame();
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);

  const handleNext = () => {
    if (revealed < conv.dialogue.length - 1) {
      const next = conv.dialogue[revealed];
      if (!next.isUser) speakChinese(next.text);
      setRevealed(r => r + 1);
    } else {
      addXP(conv.xp, `conv-${conv.id}`);
      setDone(true);
    }
  };

  if (done) return (
    <div className="text-center space-y-4 py-4">
      <div className="text-6xl">🎉</div>
      <h3 className="text-2xl font-black text-gray-800">对话完成！</h3>
      <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
        <p className="font-black text-2xl text-yellow-600">+{conv.xp} XP ⭐</p>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-4 rounded-2xl">
        继续练习 →
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100 text-center">
        <p className="text-sm font-bold text-green-600">情境：{conv.scenario}</p>
        <div className="flex justify-center gap-2 mt-1">
          {conv.keyPhrases.map(p => (
            <span key={p} className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">{p}</span>
          ))}
        </div>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {conv.dialogue.slice(0, revealed + 1).map((line, i) => (
          <div key={i} className={`flex ${line.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {!line.isUser && <span className="text-2xl mr-2 self-end">👩</span>}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              line.isUser
                ? 'bg-orange-400 text-white rounded-br-sm'
                : 'bg-white border-2 border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="text-xs font-bold opacity-70 mb-0.5">{line.speaker}</p>
              <p className="text-sm font-medium">{line.text}</p>
            </div>
            {line.isUser && <span className="text-2xl ml-2 self-end">👦</span>}
          </div>
        ))}
      </div>

      {revealed < conv.dialogue.length - 1 && (
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-600 font-bold">
            {conv.dialogue[revealed + 1].isUser ? '🎤 轮到你说了：' : '📢 对方会说：'}
          </p>
          <p className="text-sm text-gray-600 mt-1 italic">"{conv.dialogue[revealed + 1].text}"</p>
        </div>
      )}

      <div className="flex gap-2">
        {revealed < conv.dialogue.length - 1 && !conv.dialogue[revealed + 1].isUser && (
          <button
            onClick={() => speakChinese(conv.dialogue[revealed].text)}
            className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold px-4 py-3 rounded-2xl"
          >
            🔊
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-3 rounded-2xl"
        >
          {revealed < conv.dialogue.length - 1 ? '继续 →' : '完成！🎉'}
        </button>
      </div>
    </div>
  );
}

// --- Main Oral Page ---
export default function Oral() {
  const [activeTab, setActiveTab] = useState('picture');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { completeActivity } = useGame();

  const tabs = [
    { id: 'picture', label: '看图说话', emoji: '🖼️' },
    { id: 'reading', label: '朗读练习', emoji: '📖' },
    { id: 'conversation', label: '情境对话', emoji: '💬' },
  ];

  const handleStart = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleComplete = () => {
    completeActivity('oral', 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 pt-12 pb-6 px-5">
        <h1 className="text-white text-2xl font-black">🎤 口语练习</h1>
        <p className="text-orange-100 text-sm mt-1">P4 华文口语 · 大声说，不要怕！</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="flex gap-2 bg-orange-50 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all font-bold text-xs ${
                activeTab === tab.id
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'picture' && (
          <>
            <div className="bg-orange-50 rounded-2xl p-3 border-2 border-orange-100">
              <p className="text-sm font-bold text-orange-600">💡 怎么练习？</p>
              <p className="text-xs text-gray-600 mt-1">先看图，学词汇，然后用完整的句子回答问题。可以大声练习哦！</p>
            </div>
            {oralTopics.map(topic => (
              <PictureTopicCard key={topic.id} topic={topic} onStart={handleStart} />
            ))}
          </>
        )}
        {activeTab === 'reading' && (
          <>
            <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-100">
              <p className="text-sm font-bold text-blue-600">💡 怎么练习？</p>
              <p className="text-xs text-gray-600 mt-1">先听示范朗读，然后自己大声朗读，注意声调和语气！</p>
            </div>
            {readingPassages.map(p => (
              <ReadingCard key={p.id} passage={p} onStart={handleStart} />
            ))}
          </>
        )}
        {activeTab === 'conversation' && (
          <>
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-100">
              <p className="text-sm font-bold text-green-600">💡 怎么练习？</p>
              <p className="text-xs text-gray-600 mt-1">跟着情境对话，轮到你说的时候，大声说出来！注意礼貌用语哦！</p>
            </div>
            {conversations.map(c => (
              <ConversationCard key={c.id} conv={c} onStart={handleStart} />
            ))}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem?.title}
      >
        {selectedItem && activeTab === 'picture' && (
          <PictureTopicPractice
            topic={selectedItem}
            onClose={() => setModalOpen(false)}
            onComplete={handleComplete}
          />
        )}
        {selectedItem && activeTab === 'reading' && (
          <ReadingPractice
            passage={selectedItem}
            onClose={() => setModalOpen(false)}
          />
        )}
        {selectedItem && activeTab === 'conversation' && (
          <ConversationPractice
            conv={selectedItem}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
