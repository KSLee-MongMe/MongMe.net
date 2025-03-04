// import { useEffect } from "react";
import { auth, googleAuthProvider } from "../lib/firebase";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // ✅ Firestore에 사용자 정보 저장 함수 (Google, Kakao, Naver 공통)
  const saveUserData = async (user, providerName) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        name: user.displayName || "이름 없음",
        email: user.email || "이메일 없음",
        loginProvider: providerName,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Firestore에 ${providerName} 사용자 정보 저장 완료!`);
      return false; // 신규 사용자 (회원가입 필요)
    } else {
      console.log(`✅ Firestore에 ${providerName} 사용자 정보가 이미 존재합니다.`);
      return true; // 기존 사용자
    }
  };

  // ✅ 네이버 로그인 (OAuth 2.0 → Firebase Custom Token 방식)
  const handleNaverLogin = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI;
      const loginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=randomState`;

      window.location.href = loginUrl; // ✅ 네이버 로그인 페이지로 이동
    } catch (error) {
      console.error("❌ 네이버 로그인 오류:", error);
    }
  };

  // ✅ 네이버 로그인 후 Firebase 로그인 처리
  const processNaverLogin = async (code) => {
    try {
      console.log("🔄 네이버 로그인 처리 시작");
  
      // 1. 서버 API 요청: 네이버 OAuth 인증 코드로 사용자 데이터를 받음
      const response = await fetch("/api/auth/naver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
  
      // 서버에서 customToken 대신 사용자 정보(user)만 반환한다고 가정합니다.
      const { user } = await response.json();
      if (!user || !user.uid) {
        throw new Error("❌ 네이버 로그인 실패: 사용자 데이터 누락");
      }
      console.log("✅ 네이버 사용자 데이터 획득 완료:", user);
  
      // 2. Firestore에 사용자 정보 저장 및 기존 여부 확인
      const userExists = await saveUserData(user, "Naver");
  
      // 3. 기존 사용자이면 메인 페이지, 신규 사용자이면 회원가입 페이지로 이동
      if (userExists) {
        router.push("/");
      } else {
        router.push("/signup");
      }
    } catch (error) {
      console.error("❌ 네이버 로그인 처리 실패:", error);
      // 필요시 에러 처리: 예) alert, /login 페이지로 이동 등
    }
  };  

  // ✅ 카카오 로그인 (Firebase OIDC 방식)
  const handleKakaoLogin = async () => {
    try {
      const kakaoProvider = new OAuthProvider("oidc.kakao"); // ✅ OIDC 공급자 생성
      const result = await signInWithPopup(auth, kakaoProvider); // ✅ 팝업 로그인 실행
      const user = result.user;

      console.log("✅ 카카오 로그인 성공:", user);

      // ✅ Firestore에 사용자 정보 저장
      const userExists = await saveUserData(user, "Kakao");

      if (userExists) {
        router.push("/"); // 기존 사용자: 메인으로 이동
      } else {
        router.push("/signup"); // 신규 사용자: 회원가입 페이지로 이동
      }
    } catch (error) {
      console.error("❌ 카카오 로그인 실패:", error);
    }
  };

  // ✅ Google 로그인
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      // ✅ Firestore에 사용자 정보 확인 및 저장
      const userExists = await saveUserData(user, "Google");

      // ✅ 로그인 후 이동
      if (userExists) {
        router.push("/");
      } else {
        router.push("/signup");
      }
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      {/* ✅ 로고 이미지 추가 */}
      <Link href="/" passHref>
        <img
          src="/images/MongMe_logo02.png"
          alt="MongMe 로고"
          className="mb-9 w-45 cursor-pointer"
        />
      </Link>

      {/* ✅ 로그인 박스 */}
      <div className="w-full max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">로그인 또는 회원가입</h1>
        <p className="text-gray-600 text-lg mb-6">소셜 미디어로 간편하게 시작하세요!</p>

        {/* ✅ 네이버 로그인 버튼 */}
        <button
          onClick={handleNaverLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg mb-3 hover:bg-gray-100 transition"
        >
          <img src="/images/naver-icon.png" alt="네이버" className="w-6 h-6" />
          <span className="font-medium text-gray-700">네이버로 로그인</span>
        </button>

        {/* ✅ 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg mb-3 hover:bg-gray-100 transition"
        >
          <img src="/images/kakao-icon.png" alt="카카오" className="w-6 h-6" />
          <span className="font-medium text-gray-700">카카오로 로그인</span>
        </button>

        {/* ✅ 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <img src="/images/google-icon.png" alt="구글" className="w-6 h-6" />
          <span className="font-medium text-gray-700">구글로 로그인</span>
        </button>
      </div>   
      
      {/* 홈으로 버튼: 로그인 박스 밖, 아래쪽에 작게 위치 */}
      <div className="mt-4">
        <Link href="/" legacyBehavior>
          <a className="text-1xl text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition">
            홈으로
          </a>
        </Link>
      </div>
    </div>
  );
}
