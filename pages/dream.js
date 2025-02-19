import { useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";
import { saveDream, getLuckyNumber, addBonusChance } from "../lib/firestore";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import html2canvas from "html2canvas";
import ShareButtons from "../components/ShareButtons";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";

export default function DreamPage() {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [luckyNumber, setLuckyNumber] = useState(null);
  const [luckyColor, setLuckyColor] = useState("불러오는 중...");
  const [userData, setUserData] = useState(null);
  const [dreamSubmitted, setDreamSubmitted] = useState(false);
  const resultRef = useRef(null);
  const router = useRouter();

  // ✅ 사용자 데이터 및 행운의 색깔 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("🔥 Firestore 사용자 데이터:", data);
          setUserData(data);

          // ✅ 행운번호 가져오기
          const number = await getLuckyNumber(auth.currentUser.uid);
          setLuckyNumber(number);

          // ✅ 행운의 색깔 가져오기
          if (data.luckyColor) {
            console.log("✅ Firestore에서 행운의 색깔 가져오기 성공:", data.luckyColor);
            setLuckyColor(data.luckyColor);
          } else {
            console.log("⚠ Firestore에 행운의 색깔이 없음");
            setLuckyColor("정보 없음");
          }
        } else {
          console.log("❌ Firestore 사용자 데이터가 존재하지 않음");
        }
      } catch (error) {
        console.error("❌ Firestore 사용자 데이터 가져오기 실패:", error);
      }
    };

    fetchUserData();
  }, [router, auth.currentUser]); // ✅ 종속성 배열 수정

  // ✅ 꿈 저장 및 해몽 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("로그인 후 꿈을 입력해주세요.");
      return;
    }

    try {
      setInterpretation("");
      setLuckyColor("불러오는 중...");

      // ✅ Firestore에 데이터 저장 및 luckyColor 반환
      const { id: docId, luckyColor } = await saveDream(
        auth.currentUser.uid,
        dream,
        userData?.birthdate,
        userData?.mbti
      );

      setDreamSubmitted(true);
      setLuckyColor(luckyColor);

      setInterpretation("AI 해몽을 불러오는 중... ⏳");

      const response = await fetch(`/api/getDream?id=${docId}`);
      const data = await response.json();
      if (data.interpretation) {
        setInterpretation(data.interpretation);
      } else {
        setInterpretation("AI 해몽을 가져올 수 없습니다.");
      }

      setDream("");
    } catch (error) {
      alert("❌ 꿈 저장에 실패했습니다.");
      console.error("❌ 오류 상세 정보:", error);
    }
  };

  // ✅ 이미지 다운로드
  const handleDownloadImage = async () => {
    if (!resultRef.current) {
      console.error("❌ resultRef가 정의되지 않았습니다.");
      return;
    }
    try {
      const canvas = await html2canvas(resultRef.current, {
        useCORS: true, // 외부 이미지 사용 시 필요
        scale: 2, // 이미지 품질 개선
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "dream_interpretation.png";
      link.click();
    } catch (error) {
      console.error("❌ 이미지 저장 실패:", error);
    }
  };
 
  // ✅ SNS 공유 보너스 추가
  const handleShare = async () => {
    try {
      await addBonusChance(auth.currentUser.uid);
      alert("SNS 공유 완료! 추가 해몽 1회 제공됩니다.");
    } catch (error) {
      console.error("❌ SNS 공유 보너스 적용 실패:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">✨ 나의 꿈 해몽 ✨</h1>

      {!dreamSubmitted && (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <textarea
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="꿈 내용을 입력하세요..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">
            꿈 저장하기
          </button>
        </form>
      )}

      {/* ✅ 결과 표시 */}
      {interpretation && (
        <div
          ref={resultRef}
          className="mt-4 p-4 bg-gray-100 border rounded text-center w-full max-w-md"
          aria-label="AI 꿈 해몽 결과"
        >
          <h2 className="text-lg font-bold">💡 AI 꿈 해몽 💡</h2>
          <ReactMarkdown className="text-left">{interpretation}</ReactMarkdown>

          {/* ✅ 행운번호 표시 */}
          <p className="mt-2 text-center"><strong>🎟 이번 주 행운번호:</strong> {luckyNumber || "생성 중..."}</p>

          {/* ✅ 색깔 표시 영역 - 글자와 색상 상자를 가운데 정렬 */}
          <div className="mt-2 flex justify-center items-center gap-2">
            <strong>🎨 행운의 색깔:</strong>
            {luckyColor && luckyColor !== "불러오는 중..." && luckyColor !== "정보 없음" ? (
              <span
                className="inline-block px-2 py-1 rounded text-white"
                style={{ backgroundColor: luckyColor }}
              >
                {luckyColor}
              </span>
            ) : (
              <span>{luckyColor}</span>
            )}
          </div>
        </div>
      )}

      {/* ✅ 이미지 다운로드 및 SNS 공유 */}
      {interpretation && (
        <>
          <button onClick={handleDownloadImage} className="bg-green-500 text-white p-2 rounded mt-4">
            해몽 이미지 저장 📷
          </button>
          <ShareButtons interpretation={interpretation} onShare={handleShare} />
        </>
      )}
    </div>
  );
}
