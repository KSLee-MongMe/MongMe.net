import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../lib/firebase';
import { savePremiumDream } from '../lib/firestore';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';

export default function PremiumDreamPage() {
  const { user } = useAuth();
  const [dream, setDream] = useState('');
  const [result, setResult] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const resultRef = useRef(null);

  // ✅ 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);

          // 프리미엄 보너스가 1 이상이면 사용 가능
          if (data.premiumBonusChance && data.premiumBonusChance > 0) {
            setCanUsePremium(true);
          }
        }
      } catch (error) {
        console.error('사용자 데이터 가져오기 실패:', error);
      }
    };
    fetchUserData();
  }, [router, user]);

  // ✅ 프리미엄 보너스 차감 함수
  const usePremiumBonus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return false;

      const userData = userSnap.data();
      if (userData.premiumBonusChance > 0) {
        await updateDoc(userRef, {
          premiumBonusChance: userData.premiumBonusChance - 1,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('프리미엄 보너스 차감 실패:', error);
      return false;
    }
  };

  // ✅ 프리미엄 해몽 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canUsePremium) {
      alert('먼저 결제를 완료하거나 프리미엄 카운트를 확보하세요.');
      return;
    }

    try {
      setIsLoading(true);

      const success = await usePremiumBonus();
      if (!success) {
        alert('💳 프리미엄 보너스가 부족합니다.');
        return;
      }

      console.log('🔥 API 호출 데이터:', {
        userId: user?.uid,
        dreamText: dream,
        birthdate: userData?.birthdate,
        birthtime: userData?.birthtime,
        mbti: userData?.mbti,
      });

      const response = await fetch('/api/gpt-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          dreamText: dream,
          birthdate: userData?.birthdate,
          birthtime: userData?.birthtime,
          mbti: userData?.mbti,
        }),
      });

      const data = await response.json();
      console.log('🔥 API 응답 데이터:', data);

      if (response.ok) {
        setResult({
          interpretation: String(data.interpretation || ''),
          mbtiSummary: String(data.mbtiSummary || ''),
          sajuSummary: String(data.sajuSummary || ''),
          luckyNumbers: data.luckyNumbers || [],
        });
      } else {
        alert(data.error || '해몽 결과를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 프리미엄 해몽 실패:', error);
      alert('❌ 프리미엄 해몽 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 이미지 다운로드
  const handleSaveResult = async () => {
    if (!resultRef.current) {
      console.error("❌ resultRef가 정의되지 않았습니다.");
      return;
    }
    try {
      const canvas = await html2canvas(resultRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "premium-dream-result.png";
      link.click();
    } catch (error) {
      console.error("❌ 이미지 저장 실패:", error);
    }
  };

  // ✅ 결과 초기화 함수 (다시 시도)
  const handleResetResult = () => {
    setResult(null);
    setDream('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        
        <img
          src="/images/MongMe_logo02.png"
          alt="MongMe 로고"
          className="w-80 h-auto mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-center mb-4">💎 유료 꿈 해몽 💎</h1>

        {!result && (
          <p className="text-center text-gray-600 mb-6">
            MBTI와 사주를 간단히 표시하고, 상세 해몽과 2세트의 행운번호를 제공합니다.
          </p>
        )}

        {!result && userData && (
          <p className="text-gray-500 text-center mb-4">
            💫 남은 프리미엄 해몽 가능 횟수: {userData.premiumBonusChance || 0}회
          </p>
        )}

        {!result && !isLoading && (
          <>
            <form onSubmit={handleSubmit} className="w-full">
              <textarea
                className="w-full p-3 border rounded-lg mb-2"
                rows="5"
                placeholder="꿈 내용을 입력하세요..."
                value={dream}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setDream(e.target.value);
                  }
                }}
                maxLength={500}
                required
              />
              <div className="text-right text-gray-500 mb-4">
                {dream.length}/500 자
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg"
              >
                ✨ 해몽 요청하기
              </button>
            </form>

            <button
              onClick={() => router.push('/premium-payment')}
              type="button"
              className="bg-yellow-500 text-white p-2 rounded mt-4 w-full"
            >
              🔋 유료 해몽 충전
            </button>

            <button
              onClick={() => router.push('/')}
              type="button"
              className="bg-gray-500 text-white p-2 rounded mt-4 w-full"
            >
              🏠 홈으로
            </button>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center mt-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
            <p className="text-gray-600 mt-2">
              AI가 꿈을 해몽 중입니다... 잠시만 기다려주세요 ⏳
            </p>
          </div>
        )}

        {result && (
          <>
            <div
              ref={resultRef}
              className="result-container mt-6 border-t pt-4"
              aria-label="AI 꿈 해몽 결과"
            >
              <img
                src="/images/MongMe_logo02.png"
                alt="MongMe 로고"
                className="w-40 h-auto mx-auto mb-2"
              />
              <h2 className="text-xl font-semibold text-center mb-2">
                💡 해몽 결과
              </h2>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-center mt-4">🔮 MBTI 요약</h3>
                <ReactMarkdown>
                  {typeof result.mbtiSummary === "string"
                    ? result.mbtiSummary
                    : JSON.stringify(result.mbtiSummary)}
                </ReactMarkdown>

                <h3 className="text-lg font-semibold text-center mt-4">📜 사주 요약</h3>
                <ReactMarkdown>
                  {typeof result.sajuSummary === "string"
                    ? result.sajuSummary
                    : JSON.stringify(result.sajuSummary)}
                </ReactMarkdown>

                <h3 className="text-lg font-semibold text-center mt-4">💭 해몽 결과</h3>
                <ReactMarkdown>
                  {typeof result.interpretation === "string"
                    ? result.interpretation
                    : JSON.stringify(result.interpretation)}
                </ReactMarkdown>
              </div>

              <div className="mt-4 text-center">
                <p>
                  <strong>🎟 이번주 내 행운번호:</strong>{" "}
                  {userData?.luckyNumber || "N/A"}
                </p>
                <p>
                  <strong>🎟 추가 행운번호 (1세트):</strong>{" "}
                  {result.luckyNumbers?.[0]}
                </p>
                <p>
                  <strong>🎟 추가 행운번호 (2세트):</strong>{" "}
                  {result.luckyNumbers?.[1]}
                </p>
                <br />
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={handleSaveResult}
                className="bg-green-500 text-white p-2 rounded-lg"
              >
                📷 해몽 이미지 저장
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-500 text-white p-2 rounded-lg"
              >
                🏠 홈으로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
