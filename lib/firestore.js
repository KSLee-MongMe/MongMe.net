// lib/firestore.js
// 기존의 import 유지
import { db } from "./firebase";
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { format, toZonedTime } from "date-fns-tz";

// 🔹 한글 색상명을 영어 색상명으로 변환하는 매핑
const colorMap = {
  "빨간색": "red",
  "주황색": "orange",
  "노란색": "yellow",
  "초록색": "green",
  "파란색": "blue",
  "남색": "navy",
  "보라색": "purple",
  "분홍색": "pink",
  "검은색": "black",
  "흰색": "white",
  "회색": "gray",
  "갈색": "brown"
};

// ✅ KST 시간대의 타임스탬프 가져오기
const getKSTTimestamp = () => {
  const now = new Date();
  const kstDate = toZonedTime(now, "Asia/Seoul"); // ✅ date-fns-tz 사용
  // ✅ Firestore에서 저장 전 타임스탬프 값 확인
  const timestamp = Timestamp.fromDate(kstDate);
  console.log("🔥 KST Timestamp 생성:", timestamp);
  return Timestamp.fromDate(kstDate);
};

/**
 * ✅ 회원가입 시 사용자 정보 저장 (프리미엄 보너스 찬스 추가됨, KST 시간 적용)
 */
export const saveUserData = async (
  userId,
  name,
  email,
  birthdate,
  birthtime,
  mbti,
  gender
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    console.log("🔥 Firestore에 저장할 사용자 데이터:", {
      userId,
      name,
      email,
      birthdate,
      birthtime,
      mbti,
      gender,
    });

    // ✅ 1) 사용자 문서가 존재하지 않는 경우 (최초 회원가입)
    // 기존 사용자 업데이트 부분 (수정 후)
    if (!userSnap.exists()) {
      // 신규 회원 생성 시 처리 (setDoc)
      await setDoc(userRef, {
        userId,
        name,
        email,
        birthdate,
        birthtime: birthtime || "알 수 없음",
        mbti: mbti || "알 수 없음",
        gender,
        luckyNumber: null,
        luckyColor: null,
        lastDreamDate: null,
        bonusChance: 1,           // 일반 보너스 찬스 (기본값 1)
        premiumBonusChance: 1,    // 프리미엄 보너스 찬스 (기본값 1)
        lastResetDate: format(toZonedTime(new Date(), "Asia/Seoul"), "yyyy-MM-dd"), // 신규 추가된 필드
        createdAt: getKSTTimestamp(),  // KST 기준으로 저장
      });
      console.log("✅ Firestore에 사용자 정보 (최초) 저장 완료!");
    } else {
      // 기존 사용자 업데이트
      console.log("♻️ Firestore에 이미 사용자 정보가 존재합니다. 문서를 업데이트합니다.");
      const userData = userSnap.data();
      const updateData = {
        name,
        email,
        birthdate,
        birthtime: birthtime || "알 수 없음",
        mbti: mbti || "알 수 없음",
        gender,
        bonusChance: 1, // 일반 보너스 찬스를 하루 1회로 초기화
      };

      // premiumBonusChance 필드가 없으면 추가
      if (!userData.hasOwnProperty("premiumBonusChance")) {
        updateData.premiumBonusChance = 1;
        console.log("✅ Firestore: 기존 사용자에게 premiumBonusChance 필드가 추가되었습니다.");
      }
      // lastResetDate 필드가 없으면 추가 (premiumBonusChance와 동일한 방식)
      if (!userData.hasOwnProperty("lastResetDate")) {
        updateData.lastResetDate = format(toZonedTime(new Date(), "Asia/Seoul"), "yyyy-MM-dd");
        console.log("✅ Firestore: 기존 사용자에게 lastResetDate 필드가 추가되었습니다.");
      }

      await updateDoc(userRef, updateData);
      console.log("✅ Firestore 사용자 정보 업데이트 완료!");
    }
  } catch (error) {
    console.error("❌ Firestore 사용자 정보 저장 실패:", error);
    throw new Error("Firestore 사용자 정보 저장에 실패했습니다.");
  }
};

/**
 * ✅ 보너스 찬스 업데이트 (공통 함수)
 * @param {string} userId - 사용자 ID
 * @param {number} amount - 추가 또는 차감할 보너스 수량 (+1 또는 -1)
 * @param {string} action - "share" | "dream" (SNS 공유 또는 해몽 요청)
 */
export const updateBonusChance = async (userId, amount, action) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const currentBonus = userData.bonusChance || 0;
    const today = format(toZonedTime(new Date(), "Asia/Seoul"), "yyyy-MM-dd"); // ✅ KST로 변환

    // ✅ SNS 공유 시 하루에 한 번만 추가
    if (action === "share") {
      if (userData.lastBonusDate !== today) {
        await updateDoc(userRef, {
          bonusChance: currentBonus + amount,
          lastBonusDate: today,
        });
        console.log(`✅ Firestore: bonusChance가 ${currentBonus + amount}로 업데이트되었습니다.`);
        return true;
      } else {
        console.log("⚠ 오늘 이미 보너스 찬스를 획득했습니다. 추가 업데이트 없음.");
        return false;
      }
    }

    // ✅ 해몽 요청 시 보너스 찬스 차감
    if (action === "dream" && currentBonus > 0) {
      await updateDoc(userRef, {
        bonusChance: Math.max(0, currentBonus + amount),
      });
      console.log(`✅ Firestore: bonusChance가 ${currentBonus + amount}로 차감되었습니다.`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ 보너스 찬스 업데이트 실패:", error);
    return false;
  }
};

/**
 * ✅ 사용자 하루 1회 해몽 요청 가능 여부 확인
 */
export const canUserRequestDream = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false; // 사용자가 없으면 false 반환

    const userData = userSnap.data();
    const today = format(toZonedTime(new Date(), "Asia/Seoul"), "yyyy-MM-dd"); // ✅ KST로 변환

    // ✅ 1) bonusChance가 초기화된지 하루 이상 지났으면 1로 재설정
    if (userData.lastResetDate !== today) {
      await updateDoc(userRef, {
        lastResetDate: today,
        bonusChance: 1, // ✅ 하루에 한 번 bonusChance를 1로 초기화
      });
      console.log("✅ Firestore: bonusChance가 1로 초기화되었습니다.");
      return true;
    }

    // ✅ 2) bonusChance가 1 이상이면 요청 가능 -> 요청 시 1 차감
    if ((userData.bonusChance || 0) > 0) {
      await updateDoc(userRef, {
        bonusChance: Math.max(0, (userData.bonusChance || 0) - 1), // ✅ NaN 방지
      });
      console.log("✅ Firestore: bonusChance가 차감되었습니다.");
      return true;
    }

    // ✅ 3) bonusChance가 없으면 요청 불가
    return false;
  } catch (error) {
    console.error("❌ 해몽 가능 여부 확인 실패:", error);
    return false;
  }
};

/**
 * ✅ SNS 공유 후 보너스 해몽 횟수 추가 (하루에 한 번만)
 */
export const addBonusChance = async (userId) => {
  console.log("🚀 addBonusChance 함수 시작");
  return await updateBonusChance(userId, 1, "share");
};

/**
 * ✅ 사용자의 맞춤형 꿈 해몽 저장 (1일 1회 제한 적용)
 */
export const saveDream = async (userId, dreamText, birthdate, mbti) => {
  try {
    // ✅ 해몽 요청 시 보너스 찬스 차감
    const canRequest = await updateBonusChance(userId, -1, "dream");
    if (!canRequest) {
      throw new Error("오늘의 해몽 요청 횟수를 초과했습니다.");
    }

    console.log("🚀 OpenAI API 요청 시작: interpretDream");

    // ✅ 1) OpenAI를 사용하여 해몽 요청
    const response = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "interpretDream",
        dreamText,
        birthdate,
        mbti,
      }),
    });

    console.log("✅ OpenAI API interpretDream 응답 수신");
    const { result: interpretation } = await response.json();
    console.log("📝 해몽 결과:", interpretation);

    console.log("🚀 OpenAI API 요청 시작: getLuckyColor");

    // ✅ 2) OpenAI를 사용하여 행운의 색깔 요청
    const colorResponse = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getLuckyColor", dreamText }),
    });

    console.log("✅ OpenAI API getLuckyColor 응답 수신");
    const { result: luckyColorKor } = await colorResponse.json();
    console.log("🌈 행운의 색깔:", luckyColorKor);
    const luckyColorEng = colorMap[luckyColorKor] || "gray";

    // ✅ 3) Firestore에 꿈 및 해몽 정보 저장
    const docRef = await addDoc(collection(db, "dreams"), {
      userId,
      dreamText,
      interpretation,
      luckyColor: luckyColorEng,
      createdAt: getKSTTimestamp(),
    });

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      luckyColor: luckyColorEng,
    });

    console.log("✅ Firestore: 꿈 및 해몽 정보 저장 완료");

    return {
      id: docRef.id,
      luckyColor: luckyColorEng,
    };
  } catch (error) {
    console.error("❌ Firestore: 꿈 저장 실패:", error);
    throw error;
  }
};

/**
 * ✅ 사용자 계정별 1주일 동안 유지되는 행운번호 제공 (1~45)
 */
export const getLuckyNumber = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const weekStart = format(new Date(), "yyyy-ww");

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.luckyNumber && userData.luckyWeek === weekStart) {
        return userData.luckyNumber;
      }
    }

    const newLuckyNumber = Math.floor(Math.random() * 45) + 1;
    await updateDoc(userRef, {
      luckyNumber: newLuckyNumber,
      luckyWeek: weekStart
    });

    return newLuckyNumber;
  } catch (error) {
    console.error("❌ 행운번호 가져오기 실패:", error);
    return null;
  }
};

/**
 * ✅ 사용자의 프리미엄 꿈 해몽 저장 (OpenAI API 호출 제거 및 중복 차감 제거)
 */
export const savePremiumDream = async (userId, dreamText, birthdate, mbti, interpretation = "해몽 결과를 가져오는 중입니다.", mbtiSummary = "MBTI 요약 준비 중", sajuSummary = "사주 요약 준비 중", luckyNumbers = ["N/A", "N/A"]) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    console.log("🚀 Firestore: 프리미엄 꿈 해몽 저장 시작");

    // ✅ Firestore에 저장될 전체 데이터 확인
    const saveData = {
      userId,
      dreamText,
      interpretation,
      mbtiSummary,
      sajuSummary,
      luckyNumbers,
      createdAt: getKSTTimestamp(),
    };

    // ✅ 저장 직전 로그
    console.log("🔥 Firestore에 저장 직전 데이터:", saveData);

    // ✅ interpretation에 대한 추가 로그
    console.log("🔥 interpretation의 타입:", typeof interpretation);
    console.log("🔥 interpretation의 값:", interpretation);
    console.log("🔥 interpretation JSON.stringify:", JSON.stringify(interpretation, null, 2));
    try {
      console.log("🔥 interpretation JSON.parse 결과:", JSON.parse(JSON.stringify(interpretation)));
    } catch (error) {
      console.warn("⚠️ interpretation은 JSON.parse 불가능:", error.message);
    }

    // ✅ 로그 추가: createdAt이 Firestore에 저장되기 전 확인
    console.log("🔥 Firestore에 저장 직전 createdAt 값:", saveData.createdAt);

    // ✅ Firestore에 프리미엄 꿈 및 해몽 정보 저장 (API 결과는 premium-dream.js에서 처리됨)
    const docRef = await addDoc(collection(db, "premiumDreams"), saveData);

    // ✅ Firestore 저장 후 결과 로그
    console.log("✅ Firestore: 프리미엄 꿈 및 해몽 정보 저장 완료");
    console.log("✅ Firestore 저장된 문서 ID:", docRef.id);

    return {
      id: docRef.id,
    };
  } catch (error) {
    console.error("❌ Firestore: 프리미엄 꿈 저장 실패:", error);
    console.error("❌ Firestore 오류 스택 트레이스:", error.stack);
    throw error;
  }
};

/**
 * ✅ 사용자별 프리미엄 행운번호 제공 (로또 형식 6개씩 2세트)
 */
export const getLuckyNumbersPremium = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const weekStart = format(new Date(), "yyyy-ww");

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.premiumLuckyNumbers && userData.premiumLuckyWeek === weekStart) {
        return userData.premiumLuckyNumbers; // 기존에 저장된 번호 반환
      }
    }

    // ✅ 6개의 번호를 2세트 생성 (1~45 사이)
    const generateLuckySet = () => {
      const numbers = new Set();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(numbers).sort((a, b) => a - b).join(", ");
    };

    const newLuckyNumbers = [generateLuckySet(), generateLuckySet()];
    await updateDoc(userRef, {
      premiumLuckyNumbers: newLuckyNumbers,
      premiumLuckyWeek: weekStart,
    });

    return newLuckyNumbers;
  } catch (error) {
    console.error("❌ 프리미엄 행운번호 가져오기 실패:", error);
    return null;
  }
};

/**
 * ✅ 사용자의 프리미엄 보너스 찬스 추가 및 차감
 * @param {string} userId - 사용자 ID
 * @param {number} amount - 추가 또는 차감할 보너스 수량 (+1 또는 -1)
 */
export const updatePremiumBonusChance = async (userId, amount) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const userData = userSnap.data();
    const currentPremiumBonus = userData.premiumBonusChance || 0;

    // ✅ 프리미엄 보너스 업데이트
    await updateDoc(userRef, {
      premiumBonusChance: Math.max(0, currentPremiumBonus + amount),
    });

    console.log(`✅ Firestore: premiumBonusChance가 ${currentPremiumBonus + amount}로 업데이트되었습니다.`);
    return true;
  } catch (error) {
    console.error("❌ Firestore: 프리미엄 보너스 업데이트 실패:", error);
    return false;
  }
};
