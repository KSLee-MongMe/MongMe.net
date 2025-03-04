import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getKSTTimestamp } from "./firestore";
import { format, toZonedTime } from "date-fns-tz"; // date-fns-tz import 추가

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // KST 기준의 오늘 날짜를 yyyy-MM-dd 형식으로 구함
  const today = format(toZonedTime(new Date(), "Asia/Seoul"), "yyyy-MM-dd");

  // Firestore에 사용자 정보 저장 (lastResetDate 필드 추가)
  await setDoc(doc(db, "users", user.uid), {
    userId: user.uid,
    name: user.displayName,
    email: user.email,
    createdAt: getKSTTimestamp(),  // KST 기준 타임스탬프
    lastResetDate: today,         // 신규 추가된 필드
  });

  return user;
};
