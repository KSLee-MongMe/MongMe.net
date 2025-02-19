import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { saveUserData } from "../lib/firestore";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [mbti, setMbti] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 🔹 현재 로그인된 사용자 정보 가져오기
    setUser(auth.currentUser);
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, []);

  const validateMbti = (input) => {
    const validMbti = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
                      "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];
    return validMbti.includes(input.toUpperCase());
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("로그인 후 회원가입을 진행해주세요.");
      return;
    }

    if (!birthdate) {
      setError("태어난 날짜를 입력해주세요.");
      return;
    }

    if (mbti && !validateMbti(mbti)) {
      setError("올바른 MBTI를 입력해주세요.");
      return;
    }

    try {
      await saveUserData(user.uid, user.displayName, user.email, birthdate, birthtime, mbti);
      router.push("/dream"); // 🔹 회원가입 완료 후 꿈 해몽 페이지로 이동
    } catch (error) {
      setError("회원가입 실패. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSignup} className="w-full max-w-md">
        <input type="text" value={user?.displayName || ""} disabled className="w-full p-2 border rounded bg-gray-100 mt-2" />
        <input type="email" value={user?.email || ""} disabled className="w-full p-2 border rounded bg-gray-100 mt-2" />
        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full p-2 border rounded mt-2" required />
        <input type="time" value={birthtime} onChange={(e) => setBirthtime(e.target.value)} className="w-full p-2 border rounded mt-2" />
        <input type="text" placeholder="MBTI (선택)" value={mbti} onChange={(e) => setMbti(e.target.value)} className="w-full p-2 border rounded mt-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4 w-full">
          회원가입 완료
        </button>
      </form>
    </div>
  );
}
