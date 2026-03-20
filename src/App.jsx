import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// ===== 광고 =====
const REWARDED_AD_ID = 'ait-ad-test-rewarded-id';
let adLoaded = false;

function preloadRewardedAd() {
  if (!loadFullScreenAd.isSupported()) return;
  loadFullScreenAd({
    options: { adGroupId: REWARDED_AD_ID },
    onEvent: (e) => { if (e.type === 'loaded') adLoaded = true; },
    onError: () => { adLoaded = false; }
  });
}

// ===== 사운드 =====
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, dur, type = 'sine', vol = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

// ===== 유저 식별자 =====
function getUserId() {
  let uid = localStorage.getItem('1min_dream_uid');
  if (!uid) {
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('1min_dream_uid', uid);
  }
  return uid;
}

const dreamData = {
  subjects: [
    { id: 's1', icon: '🏃‍♂️', label: '사람', meaning: '인간관계나 자아의 투영' },
    { id: 's2', icon: '🐶', label: '동물', meaning: '본능적인 감정이나 직관' },
    { id: 's3', icon: '🌊', label: '자연 / 풍경', meaning: '현재의 심리적 상태나 환경' },
    { id: 's4', icon: '💰', label: '돈 / 물건', meaning: '가치관, 욕망, 혹은 에너지' },
    { id: 's5', icon: '🏠', label: '집 / 공간', meaning: '내면의 안식처나 자아상' },
    { id: 's6', icon: '👻', label: '미지의 존재', meaning: '억눌린 무의식이나 새로운 가능성' },
    { id: 's7', icon: '🚗', label: '탈것 / 교통', meaning: '삶의 방향성이나 통제력' },
    { id: 's8', icon: '✏️', label: '기타 (직접 입력)', meaning: '무의식이 주목한 당신만의 특별한 상징' },
  ],
  actions: [
    { id: 'a1', icon: '🏃', label: '쫓김 / 도망침', meaning: '회피하고 싶은 압박감' },
    { id: 'a2', icon: '🕊️', label: '하늘을 남', meaning: '자유에 대한 갈망이나 해방감' },
    { id: 'a3', icon: '🕳️', label: '끝없이 떨어짐', meaning: '통제력 상실에 대한 두려움' },
    { id: 'a4', icon: '🔍', label: '무언가를 찾음', meaning: '결핍된 요소에 대한 탐구' },
    { id: 'a5', icon: '🗣️', label: '대화를 나눔', meaning: '소통에 대한 욕구나 내면의 갈등 해결' },
    { id: 'a6', icon: '😭', label: '펑펑 움', meaning: '감정의 정화와 카타르시스' },
    { id: 'a7', icon: '🧭', label: '길을 잃음', meaning: '새로운 방향을 모색하는 과도기' },
    { id: 'a8', icon: '✏️', label: '기타 (직접 입력)', meaning: '기존의 틀을 벗어난 고유한 경험' },
  ],
  emotions: [
    { id: 'e1', icon: '🥰', label: '행복함/기쁨', color: 'from-emerald-400 to-teal-500', text: '긍정적인 에너지가 가득 차오르는 기분 좋은 하루의 시작입니다.', detail: '현재 심리적 에너지가 긍정적인 방향으로 흐르고 있으며, 무의식 속에서 스스로에 대한 확신을 얻었음을 의미합니다.', quote: '어두운 밤이 지나면 반드시 밝은 아침이 옵니다.', luckyColor: '에메랄드 그린', luckyPlace: '탁 트인 공원', stamp: '✨' },
    { id: 'e2', icon: '😰', label: '불안함', color: 'from-indigo-600 to-purple-800', text: '오늘은 내면의 불안을 안개처럼 걷어내는 날입니다.', detail: '현실의 불확실성이나 미해결된 고민이 반영된 상태지만, 이는 문제를 인지하고 대비하려는 건강한 방어 기제이기도 합니다.', quote: '안개는 결국 걷히고 선명한 길이 나타납니다.', luckyColor: '라벤더 퍼플', luckyPlace: '아늑하고 조용한 내 방', stamp: '🌙' },
    { id: 'e3', icon: '😢', label: '슬픔/먹먹함', color: 'from-blue-400 to-indigo-600', text: '억눌렸던 감정이 해소되며 마음의 평안이 찾아오고 있습니다.', detail: '평소 의식적으로 억눌러왔던 스트레스나 상실감이 안전한 꿈의 공간을 빌려 해소되고 있는 자연스러운 치유의 과정입니다.', quote: '비 온 뒤에 땅이 더욱 단단하게 굳어집니다.', luckyColor: '스카이 블루', luckyPlace: '잔잔한 물가나 호수', stamp: '💧' },
    { id: 'e4', icon: '🤔', label: '황당함', color: 'from-orange-400 to-rose-500', text: '당신의 무의식이 틀을 깨는 창의적인 영감을 던지고 있습니다.', detail: '고정관념에서 벗어나고자 하는 내면의 욕구가 발현된 것입니다. 현실의 교착 상태를 깰 수 있는 새로운 시각이 필요한 시점입니다.', quote: '가끔은 엉뚱한 상상이 세상을 바꾸는 법입니다.', luckyColor: '탠저린 오렌지', luckyPlace: '새로운 동네의 낯선 골목', stamp: '🧩' },
    { id: 'e5', icon: '🕊️', label: '평온함', color: 'from-blue-200 to-indigo-300', text: '현재의 삶이 단단하게 중심을 잡아가고 있다는 증거입니다.', detail: '최근 겪고 있던 내적, 외적 갈등이 서서히 안정기에 접어들었으며, 마음이 현실을 온전히 수용할 준비가 되었음을 나타냅니다.', quote: '고요함 속에 가장 강력하고 묵직한 힘이 있습니다.', luckyColor: '크림 화이트', luckyPlace: '따뜻한 햇살이 드는 창가', stamp: '☁️' },
    { id: 'e6', icon: '😱', label: '무서움/공포', color: 'from-slate-800 to-zinc-900', text: '안전한 현실로 돌아왔습니다. 낡은 스트레스가 몸을 빠져나간 자리입니다.', detail: '과도한 압박감이 한계치에 달했을 때 나타나는 현상입니다. 스스로를 안전하게 보호하고 충분한 휴식을 취하라는 무의식의 경고입니다.', quote: '용기는 두려움을 아는 것에서부터 시작됩니다.', luckyColor: '차콜 그레이', luckyPlace: '나를 보호해 주는 익숙한 공간', stamp: '🛡️' },
    { id: 'e7', icon: '😡', label: '분노', color: 'from-red-500 to-rose-900', text: '내면에 쌓인 스트레스가 밖으로 표출되며 해소되는 과정입니다.', detail: '현실에서 표출하지 못한 불만이나 경계 침범에 대한 저항감이 나타난 것입니다. 억압된 감정을 건강하게 풀어낼 배출구가 필요합니다.', quote: '강렬한 불꽃은 태우고 나면 재가 되어 흩어집니다.', luckyColor: '딥 레드', luckyPlace: '시원한 바람이 부는 탁 트인 곳', stamp: '🔥' },
    { id: 'e8', icon: '✏️', label: '기타 (직접 입력)', color: 'from-gray-700 to-gray-900', text: '당신만의 고유한 감정이 오늘 하루의 특별한 나침반이 될 것입니다.', detail: '정형화되지 않은 감정은 당신이 현재 복합적이고 섬세한 심리적 변화를 겪고 있음을 보여줍니다. 이 감정이 이끄는 방향에 주의를 기울여보세요.', quote: '당신의 모든 감정은 그 자체로 고유한 가치가 있습니다.', luckyColor: '오로라 펄', luckyPlace: '당신이 가장 편안함을 느끼는 곳', stamp: '💡' },
  ]
};

export default function App() {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState({ subject: null, action: null, emotion: null });
  const [customMode, setCustomMode] = useState({ isActive: false, category: null });
  const [customValue, setCustomValue] = useState("");
  const [showExit, setShowExit] = useState(false);
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const stepRef = useRef(0);

  // 유저 ID 초기화
  useEffect(() => { getUserId(); }, []);

  // stepRef 동기화
  useEffect(() => { stepRef.current = step; }, [step]);

  // 뒤로가기 제스처 차단 + 단계 역행
  useEffect(() => {
    history.pushState(null, null, location.href);
    const onPopState = () => {
      history.pushState(null, null, location.href);
      const cur = stepRef.current;
      if (cur >= 2 && cur <= 3) {
        setStep(cur - 1);
      } else {
        setShowExit(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelect = (category, item) => {
    playTone(440, 0.08, 'sine', 0.12); vibrate(15);
    if (item.id === 's8' || item.id === 'a8' || item.id === 'e8') {
      setCustomMode({ isActive: true, category });
      return;
    }
    setSelection(prev => ({ ...prev, [category]: item }));
    advanceStep();
  };

  const advanceStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setStep(4);
      preloadRewardedAd();
      setTimeout(() => setStep(5), 1500);
    }
  };

  const watchAdForResult = () => {
    if (!showFullScreenAd.isSupported() || !adLoaded) {
      setResultUnlocked(true);
      return;
    }
    if (audioCtx) audioCtx.suspend();
    showFullScreenAd({
      options: { adGroupId: REWARDED_AD_ID },
      onEvent: (e) => {
        if (e.type === 'userEarnedReward' || e.type === 'dismissed') {
          if (audioCtx) audioCtx.resume();
          setResultUnlocked(true);
          adLoaded = false;
        }
      },
      onError: () => {
        if (audioCtx) audioCtx.resume();
        setResultUnlocked(true);
      }
    });
  };

  const handleCustomSubmit = () => {
    if (!customValue.trim()) return;

    const fallbackEmotion = {
      color: 'from-gray-700 to-gray-900',
      text: '당신만의 고유한 감정이 오늘 하루의 특별한 나침반이 될 것입니다.',
      detail: '정형화되지 않은 감정은 당신이 현재 복합적이고 섬세한 심리적 변화를 겪고 있음을 보여줍니다. 이 감정이 이끄는 방향에 주의를 기울여보세요.',
      quote: '당신의 모든 감정은 그 자체로 고유한 가치가 있습니다.',
      luckyColor: '오로라 펄',
      luckyPlace: '당신이 가장 편안함을 느끼는 곳',
      stamp: '💡'
    };

    const fallbackSymbol = {
      meaning: customMode.category === 'subject'
        ? '무의식이 주목한 당신만의 특별한 상징'
        : '기존의 틀을 벗어난 고유한 경험'
    };

    const customItem = {
      id: 'custom',
      icon: '💭',
      label: customValue,
      ...(customMode.category === 'emotion' ? fallbackEmotion : fallbackSymbol)
    };

    setSelection(prev => ({ ...prev, [customMode.category]: customItem }));
    setCustomMode({ isActive: false, category: null });
    setCustomValue("");
    advanceStep();
  };

  const reset = () => {
    setSelection({ subject: null, action: null, emotion: null });
    setCustomValue("");
    setCustomMode({ isActive: false, category: null });
    setResultUnlocked(false);
    setStep(1);
  };

  const StepHeader = ({ title, currentStep }) => (
    <div className="mb-8">
      <div className="flex space-x-1 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 break-keep">{title}</h2>
    </div>
  );

  const SelectionGrid = ({ items, category }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map(item => (
        <button
          key={item.id}
          tabIndex={-1}
          onClick={() => handleSelect(category, item)}
          className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
        >
          <span className="text-4xl mb-3">{item.icon}</span>
          <span className="text-[15px] font-medium text-gray-700">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const CustomInputForm = ({ placeholder }) => (
    <div className="flex flex-col space-y-4">
      <input
        type="text"
        value={customValue}
        onChange={(e) => setCustomValue(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-[15px]"
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
      />
      <div className="flex space-x-2 mt-2">
        <button
          onClick={() => { setCustomMode({ isActive: false, category: null }); setCustomValue(""); }}
          className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200"
        >
          취소
        </button>
        <button
          onClick={handleCustomSubmit}
          disabled={!customValue.trim()}
          className="flex-1 py-3.5 bg-blue-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:bg-gray-300"
        >
          입력 완료
        </button>
      </div>
    </div>
  );

  const exitModal = showExit && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-xs text-center shadow-xl">
        <p className="text-lg font-bold text-gray-900 mb-2">앱을 종료할까요?</p>
        <p className="text-sm text-gray-500 mb-6">지금까지의 진행 상황은<br/>저장되어 있어요</p>
        <div className="flex gap-3">
          <button onClick={() => { playTone(440, 0.06); vibrate(10); setShowExit(false); }} className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600 font-semibold">계속하기</button>
          <button onClick={() => { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'CLOSE'})); else window.close(); }} className="flex-1 py-3 bg-red-500 rounded-xl text-white font-semibold">종료하기</button>
        </div>
      </div>
    </div>
  );

  if (step === 0) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-6">🌙</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">1분 꿈해몽</h1>
            <p className="text-gray-500 mb-10">간밤의 무의식이 보내는<br/>오늘의 영감을 확인하세요.</p>
            <button
              onClick={() => { playTone(523, 0.1); vibrate(20); setStep(1); }}
              className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-blue-700 transition-colors active:scale-95"
            >
              시작하기
            </button>
          </div>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <div className="min-h-screen bg-white p-6 max-w-md mx-auto flex flex-col">
          <StepHeader title="가장 기억에 남는 대상이 무엇인가요?" currentStep={1} />
          <div className="flex-1 overflow-y-auto pb-6">
            {!customMode.isActive ? (
              <SelectionGrid items={dreamData.subjects} category="subject" />
            ) : (
              <CustomInputForm placeholder="예: 돌아가신 할머니" />
            )}
          </div>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <div className="min-h-screen bg-white p-6 max-w-md mx-auto flex flex-col">
          <StepHeader title="그 대상과 연관되어 어떤 일이 일어났나요?" currentStep={2} />
          <div className="flex-1 overflow-y-auto pb-6">
            {!customMode.isActive ? (
              <SelectionGrid items={dreamData.actions} category="action" />
            ) : (
              <CustomInputForm placeholder="예: 같이 피자를 먹음" />
            )}
          </div>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <div className="min-h-screen bg-white p-6 max-w-md mx-auto flex flex-col">
          <StepHeader title="꿈에서 깨어났을 때, 어떤 감정을 느꼈나요?" currentStep={3} />
          <div className="flex-1 overflow-y-auto pb-6">
            {!customMode.isActive ? (
              <SelectionGrid items={dreamData.emotions} category="emotion" />
            ) : (
              <CustomInputForm placeholder="예: 찝찝하고 불쾌함" />
            )}
          </div>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-md mx-auto">
          <RefreshCw className="text-blue-600 animate-spin mb-6" size={40} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">무의식 조각 맞추는 중...</h2>
          <p className="text-gray-500 text-sm">당신의 선택을 심리학적 상징으로 변환하고 있어요.</p>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 5 && !resultUnlocked) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-6">🔮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">무의식 분석 완료</h2>
            <p className="text-gray-500 mb-10">짧은 광고를 시청하면<br/>꿈해몽 결과를 확인할 수 있어요.</p>
            <button
              onClick={() => { playTone(523, 0.1); vibrate(20); watchAdForResult(); }}
              className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              광고 보고 결과 열기
            </button>
          </div>
        </div>
        {exitModal}
      </>
    );
  }

  if (step === 5 && resultUnlocked) {
    const { emotion, subject, action } = selection;

    return (<>
      <div className="min-h-screen bg-black sm:p-6 flex flex-col items-center justify-center max-w-md mx-auto">
        <div className={`relative w-full min-h-[550px] bg-gradient-to-br ${emotion.color} sm:rounded-3xl p-7 flex flex-col justify-between overflow-hidden shadow-2xl`}>
          <div className="flex justify-between items-start z-10 mb-6">
            <div className="text-white/80 font-medium text-sm tracking-widest uppercase">
              Today's Unconscious
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl shadow-sm border border-white/30 shrink-0">
              {emotion.stamp}
            </div>
          </div>

          <div className="z-10 mt-auto mb-6">
            <h2 className="text-white text-[28px] font-extrabold leading-snug break-keep mb-5">
              "{emotion.text}"
            </h2>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-inner mb-4">
              <p className="text-white/95 text-[14.5px] leading-[1.6] break-keep font-medium">
                이 꿈에서 <span className="text-white font-bold bg-white/20 px-1 rounded">{subject.label}</span>은(는) {subject.meaning}을(를) 상징하며, <span className="text-white font-bold bg-white/20 px-1 rounded">{action.label}</span> 행동은 {action.meaning}을(를) 나타냅니다. 깨어난 직후 <span className="text-white font-bold bg-white/20 px-1 rounded">{emotion.label}</span>을(를) 느낀 것은, {emotion.detail}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-center text-white/90 text-[13.5px] font-semibold italic bg-black/20 py-2.5 rounded-xl border border-white/10">
                "{emotion.quote}"
              </p>
              <div className="flex gap-2 justify-center">
                <div className="flex-1 bg-white/10 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center border border-white/10">
                  <span className="text-white/60 text-[11px] font-bold mb-1 tracking-tight">행운의 컬러</span>
                  <span className="text-[13px] text-white flex items-center gap-1.5 font-medium">
                    <span className="opacity-70 text-[14px]">🎨</span>
                    <span className="truncate">{emotion.luckyColor}</span>
                  </span>
                </div>
                <div className="flex-1 bg-white/10 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center border border-white/10">
                  <span className="text-white/60 text-[11px] font-bold mb-1 tracking-tight">에너지 충전 장소</span>
                  <span className="text-[13px] text-white flex items-center gap-1.5 font-medium">
                    <span className="opacity-70 text-[14px]">📍</span>
                    <span className="truncate">{emotion.luckyPlace}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end z-10 border-t border-white/20 pt-5">
            <div className="flex flex-wrap gap-2">
              {[subject, action, emotion].map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-black/10 backdrop-blur-md text-white/90 text-[13px] rounded-lg border border-white/10">
                  #{item.label.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        </div>

        <div className="w-full mt-6 px-4 pb-8">
          <button
            onClick={reset}
            className="w-full text-gray-400 text-sm py-3 hover:text-gray-600 transition-colors"
          >
            다시하기
          </button>
        </div>
      </div>
      {exitModal}
    </>
    );
  }

  return null;
}
