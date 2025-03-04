import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { saveUserData } from "../lib/firestore";
import { useRouter } from "next/router";
import Link from "next/link";
import { getDoc, doc, updateDoc } from "firebase/firestore"; // updateDoc 추가
import { db } from "../lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [gender, setGender] = useState("");
  const [mbti, setMbti] = useState("");
  const [error, setError] = useState("");

  // 체크박스 상태 (약관 및 개인정보 처리방침)
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  // 이메일 유효성 검사 함수
  const validateEmail = (input) => /\S+@\S+\.\S+/.test(input);

  // 생년월일 및 태어난 시간 검증 함수 (YYYY-MM-DD 및 HH:MM 형식 검사)
  const validateDate = (input) => /^\d{4}-\d{2}-\d{2}$/.test(input);
  const validateTime = (input) =>
    input === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(input);

  // onAuthStateChanged로 인증 상태 확인, localStorage fallback 포함
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("onAuthStateChanged - currentUser:", currentUser);
      if (currentUser) {
        setUser(currentUser);
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("localStorage에서 user 확인:", parsedUser);
          setUser(parsedUser);
        } else {
          console.log("인증된 사용자가 없습니다. /login으로 이동합니다.");
          router.push("/login");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 입력값 자동 포맷 함수 - 생년월일: YYYY-MM-DD
  const formatBirthdate = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);
    if (digits.length < 5) {
      return digits;
    } else if (digits.length < 7) {
      return digits.slice(0, 4) + "-" + digits.slice(4);
    } else {
      return digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6, 8);
    }
  };

  // 입력값 자동 포맷 함수 - 태어난 시간: HH:MM
  const formatBirthtime = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 4) digits = digits.slice(0, 4);
    if (digits.length < 3) {
      return digits;
    } else {
      return digits.slice(0, 2) + ":" + digits.slice(2, 4);
    }
  };

  const handleBirthdateChange = (e) => {
    setBirthdate(formatBirthdate(e.target.value));
  };

  const handleBirthtimeChange = (e) => {
    setBirthtime(formatBirthtime(e.target.value));
  };

  // 회원가입 처리: user state 사용
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!email || !validateEmail(email)) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }

    if (!birthdate || !validateDate(birthdate)) {
      setError("생년월일을 YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }

    if (!validateTime(birthtime)) {
      setError("태어난 시간을 HH:MM 형식으로 입력하거나 비워두세요.");
      return;
    }

    if (!gender) {
      setError("성별을 선택해주세요.");
      return;
    }

    if (!agreedTerms || !agreedPrivacy) {
      setError("이용 약관과 개인정보 처리방침에 동의해주세요.");
      return;
    }

    if (!user) {
      setError("사용자 인증에 실패했습니다. 다시 로그인해주세요.");
      console.error("사용자 정보가 없습니다. user state가 null입니다.");
      return;
    }

    try {
      console.log("Firestore에 사용자 데이터 저장 시작:", {
        userId: user.uid,
        name,
        email,
        birthdate,
        birthtime,
        mbti,
        gender,
      });

      await saveUserData(
        user.uid,
        name,
        email,
        birthdate,
        birthtime,
        mbti,
        gender
      );
      console.log("Firestore에 사용자 정보 저장 완료!");

      // 추가: 가입이 완료되었음을 Firestore에 업데이트 (signupCompleted: true)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { signupCompleted: true }, { merge: true });
      console.log("Firestore 가입 완료 상태 업데이트 완료!");

      // 정상적인 경우 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("Firestore 사용자 정보 저장 실패:", error);
      setError("회원가입 실패. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p>로딩 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* 로고 이미지 */}
      <Link href="/">
        <img
          src="/images/MongMe_logo02.png"
          alt="MongMe 로고"
          className="mb-9 w-45 cursor-pointer"
        />
      </Link>

      <h1 className="text-2xl font-bold mb-4">
        정확한 해몽을 위한 정보를 입력하세요
      </h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* 회원가입 폼 */}
      <form onSubmit={handleSignup} className="w-full max-w-md">
        {/* 이름 입력 */}
        <label className="block text-gray-700">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          placeholder="이름을 입력하세요"
          required
        />

        {/* 이메일 입력 */}
        <label className="block text-gray-700 mt-3">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-2 border rounded mt-1 ${
            email && !validateEmail(email) ? "border-red-500" : ""
          }`}
          placeholder="example@mongme.net"
          required
        />
        {email && !validateEmail(email) && (
          <p className="text-red-500 text-sm mt-1">
            올바른 이메일 형식을 입력해주세요.
          </p>
        )}

        {/* 생년월일 입력 (자동 포맷 적용) */}
        <label className="block text-gray-700 mt-3">생년월일 (YYYY-MM-DD)</label>
        <input
          type="text"
          value={birthdate}
          onChange={handleBirthdateChange}
          className={`w-full p-2 border rounded mt-1 ${
            birthdate && !validateDate(birthdate) ? "border-red-500" : ""
          }`}
          placeholder="예: 2000-01-01"
          required
        />
        {birthdate && !validateDate(birthdate) && (
          <p className="text-red-500 text-sm mt-1">
            YYYY-MM-DD 형식으로 입력해주세요.
          </p>
        )}

        {/* 태어난 시간 입력 (자동 포맷 적용, 선택 사항) */}
        <label className="block text-gray-700 mt-3">
          태어난 시간 (HH:MM, 선택)
        </label>
        <input
          type="text"
          value={birthtime}
          onChange={handleBirthtimeChange}
          className={`w-full p-2 border rounded mt-1 ${
            birthtime && !validateTime(birthtime) ? "border-red-500" : ""
          }`}
          placeholder="예: 11:11 (또는 입력 안함)"
        />
        {birthtime && !validateTime(birthtime) && (
          <p className="text-red-500 text-sm mt-1">
            HH:MM 형식으로 입력해주세요.
          </p>
        )}

        {/* 성별 선택 */}
        <label className="block text-gray-700 mt-3">성별</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className={`w-full p-2 border rounded mt-1 ${
            !gender ? "border-red-500" : ""
          }`}
          required
        >
          <option value="">선택하세요</option>
          <option value="female">여</option>
          <option value="male">남</option>
          <option value="other">기타</option>
        </select>
        {!gender && (
          <p className="text-red-500 text-sm mt-1">
            성별을 선택해주세요.
          </p>
        )}

        {/* MBTI 선택 (선택 사항) */}
        <label className="block text-gray-700 mt-3">MBTI (선택)</label>
        <select
          value={mbti}
          onChange={(e) => setMbti(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="">선택 안 함</option>
          <option value="INTJ">INTJ</option>
          <option value="INTP">INTP</option>
          <option value="ENTJ">ENTJ</option>
          <option value="ENTP">ENTP</option>
          <option value="INFJ">INFJ</option>
          <option value="INFP">INFP</option>
          <option value="ENFJ">ENFJ</option>
          <option value="ENFP">ENFP</option>
          <option value="ISTJ">ISTJ</option>
          <option value="ISFJ">ISFJ</option>
          <option value="ESTJ">ESTJ</option>
          <option value="ESFJ">ESFJ</option>
          <option value="ISTP">ISTP</option>
          <option value="ISFP">ISFP</option>
          <option value="ESTP">ESTP</option>
          <option value="ESFP">ESFP</option>
        </select>
        
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm font-bold">
            하루 한 번 무료 해몽, SNS 공유 시 추가 기회
          </p>
          <p className="text-gray-600 text-sm font-bold">
            Thank you for sign up. 유료 해몽 1회 제공
          </p>
        </div>

        {/* 체크박스: 약관 및 개인정보 처리방침 동의 */}
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                이용 약관
              </a>
              에 동의합니다.
            </span>
          </label>
        </div>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                개인정보 처리방침
              </a>
              에 동의합니다.
            </span>
          </label>
        </div>

        {/* 회원가입 완료 버튼 (체크박스 미동의 시 비활성화) */}
        <button
          type="submit"
          disabled={!agreedTerms || !agreedPrivacy}
          className="bg-blue-500 text-white p-2 rounded mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          회원가입 완료
        </button>

        {/* 홈으로 돌아가기 버튼 */}
        <Link href="/">
          <button
            type="button"
            className="mt-3 w-full border border-gray-400 text-gray-600 p-2 rounded hover:bg-gray-100 transition"
          >
            홈으로 돌아가기
          </button>
        </Link>
      </form>
    </div>
  );
}
