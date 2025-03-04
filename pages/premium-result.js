import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function PremiumResultPage() {
  const [premiumDreams, setPremiumDreams] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const observer = useRef();
  const { user, loading } = useAuth();

  const fetchPremiumDreams = async (initialLoad = false) => {
    // (1) 로그인 상태가 아니면 로그인 페이지로
    if (!user && !loading) {
      router.push("/login");
      return;
    }

    // (2) 이미 로딩 중이면 재호출 방지
    if (isLoading) return;

    setIsLoading(true);
    try {
      const dreamsRef = collection(db, "premiumDreams");
      let dreamsQuery = query(
        dreamsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(3)
      );

      // (3) 무한 스크롤 시점이면 lastVisible 기준으로 다음 문서들 가져오기
      if (!initialLoad && lastVisible) {
        dreamsQuery = query(
          dreamsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(3)
        );
      }

      const dreamsSnap = await getDocs(dreamsQuery);

      if (dreamsSnap.empty) {
        setHasMore(false);
      } else {
        const dreamsList = dreamsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // (4) 중복 필터링
        setPremiumDreams((prevDreams) => {
          const existingIds = new Set(prevDreams.map((dream) => dream.id));
          const filteredNewDreams = dreamsList.filter((dream) => !existingIds.has(dream.id));
          return [...prevDreams, ...filteredNewDreams];
        });

        setLastVisible(dreamsSnap.docs[dreamsSnap.docs.length - 1]);
      }
    } catch (error) {
      console.error("❌ 유료 해몽 데이터 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // (5) user와 loading이 확정된 뒤, 첫 로드
  useEffect(() => {
    if (!loading && user) {
      fetchPremiumDreams(true);
    }
  }, [user, loading]);

  // (6) IntersectionObserver: 마지막 아이템이 화면에 보이면 추가 데이터 로드
  const lastDreamElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPremiumDreams();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  if (premiumDreams.length === 0 && !isLoading) {
    return <p className="text-center mt-10">🔍 유료 꿈 해몽 기록이 없습니다.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">📜 유료 꿈 해몽 결과</h1>

        {premiumDreams.map((dream, index) => (
          <div
            key={dream.id}
            ref={index === premiumDreams.length - 1 ? lastDreamElementRef : null}
            className="mb-6 p-4 border rounded-lg bg-gray-50"
          >
            <h2 className="text-lg font-semibold mb-2">💭 꿈 내용:</h2>
            <p>{dream.dreamText}</p>

            <h2 className="text-lg font-semibold mt-4">✨ 해몽 결과:</h2>
            <ReactMarkdown className="prose max-w-none">{dream.interpretation}</ReactMarkdown>

            <div className="mt-4 space-y-2">
              <p>🔮 <strong>MBTI 요약:</strong></p>
              <ReactMarkdown className="prose max-w-none">{dream.mbtiSummary}</ReactMarkdown>

              <p>📜 <strong>사주 요약:</strong></p>
              <ReactMarkdown className="prose max-w-none">{dream.sajuSummary}</ReactMarkdown>

              <p>🎟️ <strong>행운번호 (1세트):</strong> {dream.luckyNumbers[0]}</p>
              <p>🎟️ <strong>행운번호 (2세트):</strong> {dream.luckyNumbers[1]}</p>
            </div>
          </div>
        ))}

        {isLoading && <p className="text-center mt-4">⏳ 데이터를 불러오는 중입니다...</p>}
        {!hasMore && <p className="text-center mt-4">✅ 모든 기록을 불러왔습니다.</p>}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
