import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  setPersistence, 
  browserLocalPersistence,
  signInWithPopup 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ✅ Firebase 초기화 (중복 실행 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Firestore 초기화
const db = getFirestore(app);

// ✅ Firebase 인증 초기화 (브라우저 환경에서만 실행)
const auth = typeof window !== "undefined" ? getAuth(app) : null;

// ✅ 인증 공급자 (Google, Kakao, Naver)
const googleAuthProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null;
const kakaoAuthProvider = typeof window !== "undefined" ? new OAuthProvider("oidc.kakao") : null;
const naverAuthProvider = typeof window !== "undefined" ? new OAuthProvider("oidc.naver") : null;

// ✅ 인증 지속성 설정 (브라우저 환경에서만 실행)
if (auth) {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Firebase 인증 지속성 설정 완료");
    })
    .catch((error) => {
      console.error("Firebase 인증 지속성 설정 실패:", error);
    });
}

// ✅ OIDC 로그인 함수 (카카오 & 네이버)
const signInWithOIDC = async (provider) => {
  try {
    let providerInstance = null;
    if (provider === "kakao") {
      providerInstance = kakaoAuthProvider;
    } else if (provider === "naver") {
      providerInstance = naverAuthProvider;
    }
    if (!providerInstance) {
      throw new Error(`❌ ${provider} 로그인 공급자가 존재하지 않습니다.`);
    }
    const result = await signInWithPopup(auth, providerInstance);
    console.log(`✅ ${provider} 로그인 성공:`, result.user);
    return result.user; // 로그인 성공 시 사용자 정보 반환
  } catch (error) {
    console.error(`❌ ${provider} 로그인 실패:`, error);
    throw error;
  }
};

export { auth, db, googleAuthProvider, kakaoAuthProvider, naverAuthProvider, signInWithOIDC };
