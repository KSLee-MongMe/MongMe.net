import { db } from "./firebase";
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { interpretDream, getLuckyColor } from "./gpt";
import { format } from "date-fns";

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

/**
 * ✅ 회원가입 시 사용자 정보 저장
 */
export const saveUserData = async (userId, name, email, birthdate, birthtime, mbti) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId,
        name,
        email,
        birthdate,
        birthtime: birthtime || "알 수 없음",
        mbti: mbti || "알 수 없음",
        luckyNumber: null,
        luckyColor: null,
        lastDreamDate: null,
        bonusChance: 0,
        createdAt: Timestamp.now(),
      });

      console.log("✅ Firestore에 사용자 정보 저장 완료!");
    } else {
      console.log("ℹ️ Firestore에 이미 사용자 정보가 존재합니다.");
    }
  } catch (error) {
    console.error("❌ Firestore 사용자 정보 저장 실패:", error);
  }
};

/**
 * ✅ 사용자 하루 1회 해몽 요청 가능 여부 확인
 */
export const canUserRequestDream = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const today = format(new Date(), "yyyy-MM-dd");

    if (userSnap.exists()) {
      const userData = userSnap.data();

      if (userData.lastDreamDate === today && userData.bonusChance === 0) {
        return false;
      }

      await updateDoc(userRef, {
        lastDreamDate: today,
        bonusChance: Math.max(0, userData.bonusChance - 1),
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ 해몽 가능 여부 확인 실패:", error);
    return false;
  }
};

/**
 * ✅ SNS 공유 후 보너스 해몽 횟수 추가
 */
export const addBonusChance = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { bonusChance: 1 });
    console.log("✅ SNS 공유 보너스 적용 완료!");
  } catch (error) {
    console.error("❌ SNS 공유 보너스 적용 실패:", error);
  }
};

/**
 * ✅ 사용자의 맞춤형 꿈 해몽 저장 (1일 1회 제한 적용) - luckyColor 반환 추가
 */
export const saveDream = async (userId, dreamText, birthdate, mbti) => {
  try {
    const canRequest = await canUserRequestDream(userId);
    if (!canRequest) {
      throw new Error("오늘의 해몽 요청 횟수를 초과했습니다.");
    }

    const interpretation = await interpretDream(dreamText, birthdate, mbti);

    const luckyColorKor = await getLuckyColor(dreamText);
    const luckyColorEng = colorMap[luckyColorKor] || "gray";
    console.log("🎨 생성된 행운의 색깔:", luckyColorEng);

    const docRef = await addDoc(collection(db, "dreams"), {
      userId,
      dreamText,
      interpretation,
      luckyColor: luckyColorEng,
      createdAt: Timestamp.now(),
    });

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { luckyColor: luckyColorEng });

    console.log("🔥 꿈 & 해몽 저장 완료! 문서 ID:", docRef.id);
    console.log("🎨 Firestore에 행운의 색깔 업데이트 완료:", luckyColorEng);

    // 🔹 Firestore 업데이트 후 luckyColor 반환
    return {
      id: docRef.id,
      luckyColor: luckyColorEng
    };
  } catch (error) {
    console.error("❌ 꿈 저장 실패:", error);
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
      luckyWeek: weekStart,
    });

    return newLuckyNumber;
  } catch (error) {
    console.error("❌ 행운번호 가져오기 실패:", error);
    return null;
  }
};
