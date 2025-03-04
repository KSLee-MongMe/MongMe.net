// ✅ Firestore 및 OpenAI API 불러오기
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { interpretSaju, interpretMBTI, interpretPremiumDream } from '../../lib/gpt';

export default async function handler(req, res) {
  try {
    // ✅ 1. 메소드 확인: POST만 허용
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // ✅ 2. 요청 데이터 추출 및 검증
    const { userId, dreamText } = req.body;
    console.log("🔥 서버 수신 데이터 (req.body):", req.body);

    if (!userId || !dreamText) {
      console.warn("⚠️ 요청 데이터가 부족합니다: userId 또는 dreamText가 없습니다.");
      return res.status(400).json({ error: '필수 파라미터(userId, dreamText)가 누락되었습니다.' });
    }

    // ✅ 3. Firestore에서 사용자 정보 가져오기
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("⚠️ 사용자 정보를 찾을 수 없습니다:", userId);
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // ✅ 사용자 데이터 초기화 및 검증
    const userData = userSnap.data();
    const { birthdate, birthtime, mbti, luckyNumber } = userData || {};
    console.log("🔥 Firestore 사용자 데이터:", userData);

    if (!birthdate || !birthtime || !mbti) {
      console.warn("⚠️ 사용자 정보 불완전: birthdate, birthtime, 또는 mbti 누락");
      return res.status(400).json({ error: '사용자의 생년월일, 태어난 시간, MBTI 정보가 필요합니다.' });
    }

    // ✅ 4. OpenAI API 호출 (1개월 사주 정보 - 200토큰)
    let sajuSummary;
    try {
      console.log("⏳ OpenAI API 호출 시작: interpretSaju");
      sajuSummary = await interpretSaju(birthdate, birthtime);
      console.log("✅ OpenAI API 호출 완료: interpretSaju =", sajuSummary);
    } catch (error) {
      console.error("❌ 1개월 사주 정보 실패:", error.message);
      sajuSummary = '사주 요약 없음';
    }

    // ✅ 5. OpenAI API 호출 (MBTI 성향 - 200토큰)
    let mbtiSummary;
    try {
      console.log("⏳ OpenAI API 호출 시작: interpretMBTI");
      mbtiSummary = await interpretMBTI(mbti);
      console.log("✅ OpenAI API 호출 완료: interpretMBTI =", mbtiSummary);
    } catch (error) {
      console.error("❌ MBTI 성향 실패:", error.message);
      mbtiSummary = 'MBTI 요약 없음';
    }

    // ✅ OpenAI API 호출 (자세한 해몽 결과 - 1000토큰)
    let interpretation;
    try {
    interpretation = await interpretPremiumDream(dreamText, sajuSummary, mbtiSummary);
    interpretation = typeof interpretation === 'object' && interpretation.interpretation
        ? interpretation.interpretation
        : interpretation;
        

    // 🔥 추가 로그
    console.log("🔥 interpretation의 JSON.parse 가능 여부:", (() => {
        try {
        return JSON.parse(interpretation);
        } catch (error) {
        return "✅ 순수 문자열";
        }
    })());
    } catch (error) {
    console.error("❌ 자세한 해몽 결과 실패:", error.message);
    interpretation = "자세한 해몽 결과를 가져올 수 없습니다.";
    }

    // ✅ 7. 로또 행운번호 추출 (사용자 행운번호 + 랜덤 5개)
    const generateLuckySetWithUserNumber = (userLuckyNumber) => {
      const numbers = new Set([userLuckyNumber]); // ✅ 사용자 행운번호 추가
      while (numbers.size < 6) {
        const randomNum = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNum);
      }
      return Array.from(numbers).sort((a, b) => a - b).join(', ');
    };

    const luckyNumbers = [
      generateLuckySetWithUserNumber(luckyNumber || Math.floor(Math.random() * 45) + 1),
      generateLuckySetWithUserNumber(luckyNumber || Math.floor(Math.random() * 45) + 1),
    ];
    console.log("✅ 로또 행운번호 (사용자 포함):", luckyNumbers);

    // ✅ 8. Firestore에 프리미엄 꿈 해몽 결과 추가
    const premiumDreamRef = await addDoc(collection(db, 'premiumDreams'), {
    userId,
    dreamText,
    sajuSummary,
    mbtiSummary,
    interpretation: typeof interpretation === 'string' 
        ? interpretation 
        : interpretation.interpretation,   // ✅ 핵심 부분: interpretation의 문자열만 저장
    luckyNumbers,
    createdAt: new Date(),
    });

    console.log(`✅ Firestore: premiumDreams에 데이터 추가 완료 (ID: ${premiumDreamRef.id})`);

    // ✅ 9. 응답 반환
    return res.status(200).json({
      sajuSummary,
      mbtiSummary,
      interpretation: typeof interpretation === 'string' 
        ? interpretation 
        : JSON.stringify(interpretation, null, 2), // ✅ 문자열화 처리
      luckyNumbers,
    });
      

  } catch (error) {
    console.error("❌ API 요청 실패:", error.message);
    return res.status(500).json({ error: "서버에서 API 호출 중 오류가 발생했습니다." });
  }
}
