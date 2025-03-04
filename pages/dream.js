import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { saveDream, getLuckyNumber, addBonusChance } from "../lib/firestore";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";

export default function DreamPage() {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [luckyNumber, setLuckyNumber] = useState(null);
  const [luckyColor, setLuckyColor] = useState("불러오는 중...");
  const [userData, setUserData] = useState(null);
  const [dreamSubmitted, setDreamSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // const colorMap = {
  //   빨간색: "red",
  //   주황색: "orange",
  //   노란색: "yellow",
  //   초록색: "green",
  //   파란색: "blue",
  //   남색: "navy",
  //   보라색: "purple",
  //   분홍색: "pink",
  //   검은색: "black",
  //   흰색: "white",
  //   회색: "gray",
  //   갈색: "brown",
  // };

  // // 유효한 CSS 색상인지 검증
  // const isValidColor = (color) => {
  //   const s = new Option().style;
  //   s.color = color;
  //   return s.color !== "";
  // };

  // 사용자 데이터 및 행운번호 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          const number = await getLuckyNumber(user.uid);
          setLuckyNumber(number);
          setLuckyColor(data.luckyColor || "정보 없음");
        }
      } catch (error) {
        console.error("❌ Firestore 사용자 데이터 가져오기 실패:", error);
      }
    };
    if (!loading) {
      fetchUserData();
    }
  }, [router, user, loading]);

  // 꿈 저장 및 해몽 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인 후 꿈을 입력해주세요.");
      return;
    }
    try {
      setIsLoading(true);
      setInterpretation("");
      setLuckyColor("불러오는 중...");

      // Firestore에 꿈 저장
      const { id: docId } = await saveDream(
        user.uid,
        dream,
        userData?.birthdate,
        userData?.mbti
      );

      setDreamSubmitted(true);
      setInterpretation("AI 해몽을 불러오는 중... ⏳");

      // OpenAI API 호출 (해몽 결과)
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interpretDream",
          dreamText: dream,
          birthdate: userData?.birthdate,
          mbti: userData?.mbti,
        }),
      });
      const data = await response.json();
      let newInterpretation = data.result || "AI 해몽을 가져올 수 없습니다.";
      setInterpretation(newInterpretation);

      // OpenAI API 호출 (행운의 색깔)
      const colorResponse = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getLuckyColor",
          dreamText: dream,
        }),
      });
      const colorData = await colorResponse.json();
      let newLuckyColor = colorData.result || "정보 없음";
      setLuckyColor(newLuckyColor);

      // Firestore에 해몽 결과 및 luckyColor 업데이트
      const dreamRef = doc(db, "dreams", docId);
      await updateDoc(dreamRef, {
        interpretation: newInterpretation,
        luckyColor: newLuckyColor,
      });

      setDream("");
    } catch (error) {
      alert("❌ 꿈 저장 및 해몽 요청에 실패했습니다.");
      console.error("❌ 오류 상세 정보:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 다운로드
  const handleDownloadImage = async () => {
    if (!resultRef.current) {
      console.error("❌ resultRef가 정의되지 않았습니다.");
      return;
    }
    try {
      const canvas = await html2canvas(resultRef.current, {
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "dream_interpretation.png";
      link.click();

      // 추가 해몽 찬스 제공: user.uid 사용
      await addBonusChance(user.uid);
      alert("📸 캡처 완료! 추가 해몽 기회가 제공되었습니다.");
    } catch (error) {
      console.error("❌ 이미지 저장 실패:", error);
    }
  };

  // 공유 관련 함수들 (handleShare, copyToClipboard) 그대로 유지...

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init("c2aa4d1a2bec2127bcf21646d6a87b5d");
      }
    } else {
      console.error("❌ Kakao SDK 로드 실패");
    }
  }, []);

  // SNS 공유 함수: handleShare, copyToClipboard 등 그대로 유지...

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      {/* 상단 로고 */}
      <img src="/images/MongMe_logo02.png" alt="MongMe 로고" className="w-80 h-auto mx-auto" />

      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold mb-2">✨ 나의 꿈 해몽 ✨</h1>

      {/* 남은 해몽 가능 횟수 */}
      {!interpretation && userData && (
        <p className="text-gray-500 text-center">
          💫 오늘 남은 해몽 가능 횟수: {userData.bonusChance || 0}회
        </p>
      )}

      {/* 꿈 입력 예시 */}
      {!dreamSubmitted && (
        <div className="w-full max-w-md bg-gray-200 p-3 rounded text-gray-700 text-sm mb-4">
          📝 <strong>나의 꿈을 이렇게 입력해보세요!</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>“돼지가 집으로 들어오는 꿈을 꿨어요. 색깔은 검은색이었고 활기찼어요.”</li>
            <li>“시험을 보는데 문제를 전부 풀지 못해 걱정이 많았어요.”</li>
            <li>“친구와 여행을 가다가 길을 잃었는데 결국 멋진 풍경을 발견했어요.”</li>
          </ul>
        </div>
      )}

      {/* 입력 폼 및 로딩 스피너 */}
      {!dreamSubmitted && (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <textarea
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="꿈 내용을 입력하세요..."
            maxLength={200}
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            required
          />
          {isLoading ? (
            <div className="flex flex-col items-center mt-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
              <p className="text-gray-600 mt-2">
                AI가 당신의 꿈을 해몽 중입니다... 잠시만 기다려주세요 ⏳
              </p>
            </div>
          ) : (
            <>
              <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">
                💾 꿈 저장 및 해몽 요청하기
              </button>
              <button
                onClick={() => router.push("/premium-dream")}
                type="button"
                className="bg-yellow-400 text-black p-2 rounded mt-2 w-full"
              >
                💎 더 정확한 해몽과 AI가 추천하는 행운번호 (유료)
              </button>
              <button
                onClick={() => router.push("/")}
                type="button"
                className="bg-gray-500 text-white p-2 rounded mt-2 w-full"
              >
                🏠 홈으로
              </button>
            </>
          )}
        </form>
      )}

      {/* 결과 표시 */}
      {interpretation && (
        <div
          ref={resultRef}
          className="mt-4 p-4 bg-gray-100 border rounded text-center w-full max-w-md"
          aria-label="AI 꿈 해몽 결과"
        >
          <img src="/images/MongMe_logo02.png" alt="MongMe 로고" className="w-20 h-auto mx-auto mb-2" />
          <h2 className="text-lg font-bold mb-2">💡 AI 꿈 해몽 💡</h2>
          <ReactMarkdown className="text-left">{interpretation}</ReactMarkdown>
          <p className="mt-2 text-center">
            <strong>🎟 이번 주 행운번호:</strong> {luckyNumber || "생성 중..."}
          </p>
          <div className="mt-2 flex justify-center items-center gap-2">
            <strong>🎨 행운의 색깔:</strong>
            <span className="text-lg font-bold">{luckyColor}</span>
          </div>
        </div>
      )}

      {/* 이미지 다운로드 및 SNS 공유 */}
      {interpretation && (
        <>
          <button onClick={handleDownloadImage} className="bg-green-500 text-white p-2 rounded mt-4">
            📷 해몽 이미지 저장
          </button>
          <p className="text-gray-500 text-center mt-4">
            이미지를 저장하고 하루 한 번 내 해몽 결과를 공유해서 추가 해몽 찬스를 받으세요!
          </p>
          <div className="flex gap-4 mt-2 justify-center">
            <button onClick={() => handleShare("facebook")} className="w-12 h-12 bg-blue-600 text-white rounded-full">
              <img src="/images/facebook-icon.png" alt="Facebook" />
            </button>
            <button onClick={() => handleShare("twitter")} className="w-12 h-12 bg-blue-400 text-white rounded-full">
              <img src="/images/twitter-icon.png" alt="Twitter" />
            </button>
            <button onClick={() => handleShare("kakao")} className="w-12 h-12 bg-yellow-400 text-black rounded-full">
              <img src="/images/kakao-icon.png" alt="KakaoTalk" />
            </button>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white p-2 rounded mt-4 w-full max-w-md"
          >
            🏠 홈으로
          </button>
        </>
      )}
    </div>
  );
}
