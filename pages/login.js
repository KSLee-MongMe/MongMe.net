import { useEffect } from "react";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          router.push("/dream");
        } else {
          router.push("/signup");
        }
      }
    });
  }, []);

  // ✅ 각 로그인 버튼 클릭 시 콘솔에 메시지 표시 (추후 실제 로그인 기능 추가 예정)
  const handleNaverLogin = () => {
    console.log("네이버 로그인 클릭됨 (추후 기능 추가 예정)");
  };

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 클릭됨 (추후 기능 추가 예정)");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      {/* ✅ 로그인 박스 */}
      <div className="w-full max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">회원가입</h1>
        <p className="text-gray-600 text-lg mb-6">
        소셜 미디어로 손쉽게 가입하세요!
        </p>

        {/* ✅ 네이버 로그인 버튼 */}
        <button
          onClick={handleNaverLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg mb-3 hover:bg-gray-100 transition"
        >
          <img src="/images/naver-icon.png" alt="네이버" className="w-6 h-6" />
          <span className="font-medium text-gray-700">네이버로 쉬운 가입</span>
        </button>

        {/* ✅ 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg mb-3 hover:bg-gray-100 transition"
        >
          <img src="/images/kakao-icon.png" alt="카카오" className="w-6 h-6" />
          <span className="font-medium text-gray-700">카카오로 쉬운 가입</span>
        </button>

        {/* ✅ 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <img src="/images/google-icon.png" alt="구글" className="w-6 h-6" />
          <span className="font-medium text-gray-700">구글로 쉬운 가입</span>
        </button>
      </div>
    </div>
  );
}
