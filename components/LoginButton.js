import { auth, signInWithPopup, GoogleAuthProvider } from "../lib/firebase";
import { useState } from "react";

export default function LoginButton() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("로그인 창이 닫혔습니다. 다시 시도해주세요.");
      } else {
        setErrorMessage("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("Firebase 로그인 오류:", error);
      }
    }
  };

  return (
    <div className="text-center">
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
        Google 로그인
      </button>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
}
