import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default function LoginCallback() {
  const router = useRouter();
  const processCalled = useRef(false); // 중복 실행 방지 플래그

  useEffect(() => {
    const processLogin = async () => {
      if (processCalled.current) return;
      processCalled.current = true;
      try {
        console.log("🔄 로그인 콜백 시작...");

        const urlParams = new URLSearchParams(window.location.search);
        const provider = urlParams.get("provider");
        const code = urlParams.get("code");

        if (!provider || !code) {
          throw new Error("❌ 로그인 인증 정보가 없습니다.");
        }

        console.log(`🔄 ${provider} 로그인 처리 시작...`);

        // 서버 API 호출하여 사용자 데이터 획득
        const response = await fetch(`/api/auth/${provider}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`❌ ${provider} 로그인 실패: 서버 응답 오류`);
        }

        const userData = await response.json();
        if (!userData.uid) throw new Error("❌ 서버에서 UID가 반환되지 않았습니다.");

        console.log("✅ 사용자 데이터 획득 완료", userData);

        // LocalStorage에 사용자 정보 저장 (AuthContext에서 fallback으로 사용)
        localStorage.setItem("user", JSON.stringify(userData));

        // Firestore에서 해당 사용자의 가입 완료 상태 재확인
        const userRef = doc(db, "users", userData.uid);
        const userSnap = await getDoc(userRef, { source: "server" });
        let signupCompleted = false;
        if (userSnap.exists()) {
          const docData = userSnap.data();
          signupCompleted = docData.signupCompleted === true;
          console.log("Firestore 가입 완료 상태:", signupCompleted);
        }

        // 재확인 결과를 바탕으로 전체 페이지 리프래시 방식의 리다이렉트
        if (!signupCompleted) {
          console.log("✅ 신규 사용자 또는 가입 미완료 → 회원가입 페이지로 이동");
          window.location.href = "/signup";
        } else {
          console.log("✅ 기존 사용자 → 메인 페이지로 이동");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("❌ 로그인 처리 실패:", error);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        router.push("/login");
      }
    };

    processLogin();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold">로그인 중입니다...</h1>
    </div>
  );
}
