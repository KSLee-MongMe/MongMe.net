import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth(); // 전역 인증 컨텍스트에서 user와 loading 받아오기
  const [userName, setUserName] = useState(null);
  const [signupCompleted, setSignupCompleted] = useState(true); // 가입 완료 여부 상태 추가 (SNS 로그인 시 false로 생성)
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  console.log(router.pathname);

  // ✅ 인앱 브라우저 감지 및 외부 브라우저 리디렉션 함수
  const openInExternalBrowser = () => {
    const url = window.location.href;

    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${url.replace("https://", "")}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `googlechrome://${url.replace("https://", "")}`;
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const isInAppBrowser = /KAKAOTALK|FBAN|FBAV|Instagram/i.test(navigator.userAgent);
    if (isInAppBrowser) {
      openInExternalBrowser();
      return; // ✅ 강제 이동 후 나머지 코드 실행 방지
    }
  }, []);

  // 전역 인증 상태(user)가 로딩이 끝난 후, Firestore에서 사용자 이름 및 가입 완료 여부 가져오기
  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(userData.name);
          setSignupCompleted(userData.signupCompleted); // 가입 완료 여부 설정
        }
      } catch (error) {
        console.error("❌ Firestore 사용자 데이터 가져오기 실패:", error);
      }
    };

    if (!loading && user) {
      fetchUserData(user.uid);
    } else if (!loading && !user) {
      setUserName(null);
    }
  }, [user, loading]);

  // 로그아웃 함수: 로그아웃 후 페이지를 리프래시하여 전체 상태를 초기화합니다.
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      window.location.reload();
      console.log("🚪 로그아웃 완료");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  // 대상 페이지를 결정하는 헬퍼 함수
  // 로그인하지 않은 경우: 로그인 페이지, 로그인 후 가입 완료되지 않은 경우: 가입 페이지, 그 외: 원래 타겟
  const getTarget = (target) => {
    return user ? (signupCompleted ? target : "/signup") : "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 text-white">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-6 bg-indigo-800 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">夢ME</h1>
        <div className="flex gap-4 items-center">
          {isMounted && user ? (
            <>
              <span className="text-lg font-medium">{userName || '사용자'} 님</span>
              <Link href={getTarget("/profile")} legacyBehavior>
                <a className="px-4 py-2 border border-white rounded hover:bg-white hover:text-indigo-800 transition">
                  개인정보
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
              >
                LOGOUT
              </button>
            </>
          ) : (
            isMounted && (
              <>
                <Link href="/login" legacyBehavior>
                  <a className="px-4 py-2 border border-white rounded hover:bg-white hover:text-indigo-800 transition">
                    SIGN IN
                  </a>
                </Link>
                <Link href="/login" legacyBehavior>
                  <a className="px-4 py-2 bg-white text-indigo-800 rounded hover:bg-indigo-600 hover:text-white transition">
                    SIGN UP
                  </a>
                </Link>
              </>
            )
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex flex-col items-center text-center px-6 py-12 space-y-8">
        <h2 className="text-4xl font-extrabold leading-snug">
          어젯밤 당신이 꾼 그 꿈, <br /> 오늘 나에게 행운을 가져다줄까? 🌙✨
        </h2>
        <p className="text-lg max-w-2xl">
          꿈은 그저 단순한 상상이 아니에요.
          <br />
          어쩌면 당신에게 특별한 행운을 가져다 줄 신호일지도 몰라요.
          <br />
          🐷 돼지를 봤다고 무조건 복이 오는 건 아니고, 🐍 뱀을 봤다고 나쁜 일만 생기는 것도 아니죠.
          <br />
          누군가에게는 행운의 징조가, 다른 누군가에게는 경고일 수도 있으니까요!
          <br />
          지금 바로 AI로 꿈을 해몽해보고, 당신에게 다가올 행운까지 확인해보세요! 🎉
          <br />
          혹시 몰라요. 오늘이 바로 복권을 사야 하는 날일지도요! 💸✨
        </p>

        {/* ✅ target="_blank" 추가로 새 창에서 열기 */}
        {isMounted && (
          <Link href={getTarget("/dream")} legacyBehavior>
            <a target="_blank" rel="noopener noreferrer" className="mt-8 block px-8 py-3 bg-yellow-400 text-indigo-800 font-bold text-lg rounded-full hover:bg-yellow-500 transition">
              ✨ 지금 바로 시작해보세요!
            </a>
          </Link>
        )}

        {/* ✅ 강제 이동이 불가능한 경우, 사용자에게 외부 브라우저에서 열기 버튼 제공 */}
        <p className="text-red-300">카카오톡/페이스북/인스타그램 브라우저에서는 일부 기능이 제한될 수 있습니다.</p>
        <button
          onClick={openInExternalBrowser}
          className="px-6 py-3 bg-white text-indigo-800 rounded-full border border-white hover:bg-indigo-600 hover:text-white transition"
        >
          📌 크롬 / 사파리에서 열기
        </button>

        {/* 나머지 UI 구성 요소는 그대로 유지 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mt-12">
          <div className="p-6 bg-white text-indigo-800 rounded-lg shadow-lg space-y-4">
            <h3 className="text-xl font-bold">🔮 꿈의 의미</h3>
            <p>AI가 당신의 꿈을 해석해드립니다.</p>
          </div>
          <div className="p-6 bg-white text-indigo-800 rounded-lg shadow-lg space-y-4">
            <h3 className="text-xl font-bold">🌱 맞춤형 해몽</h3>
            <p>당신의 생년월일, 태어난 시간, 그리고 MBTI를 반영한 맞춤형 해몽!</p>
          </div>
          <div className="p-6 bg-white text-indigo-800 rounded-lg shadow-lg space-y-4">
            <h3 className="text-xl font-bold">💸 고민 해결부터 대인관계까지</h3>
            <p>답답했던 당신의 마음 속 고민을 시원하게!</p>
          </div>
          <div className="p-6 bg-white text-indigo-800 rounded-lg shadow-lg space-y-4">
            <h3 className="text-xl font-bold">🍀 이번 주의 행운 번호</h3>
            <p>당신에게 다가올 행운의 숫자도 함께 알아보세요!</p>
          </div>
        </div>

        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">💬 다른 사람들은 이런 꿈을 꿨어요!</h3>
          <div className="space-y-4">
            <p>🐷🐶 <strong>돼지랑 개가 싸우는 꿈</strong> – 이거 돼지꿈이야, 개꿈이야? 결과에 따라 복권 사러 갈지 고민 중!</p>
            <p>🎓📚 <strong>시험 보는데 문제지가 외계어야!</strong> – 이건 성적이 오를 신호일까, 공부하란 경고일까?</p>
            <p>💣🎉 <strong>폭탄이 터졌는데 폭탄에서 폭죽이 나왔어</strong> – 예상치 못한 깜짝 행운이 곧 찾아온다는데?!</p>
            <p>🚗🐌 <strong>차를 몰고 가는데 거북이보다 느려 ☹</strong> – 답답했던 일이 엄청 빠르게 풀릴거라는데?!</p>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">🚀 무료로 시작하고, 더 깊이 알고 싶다면?</h3>
          <p className="max-w-2xl mx-auto">
            매일 무료로 당신의 꿈을 해몽해보세요.
            <br />
            더 구체적인 해석과 행운의 번호는 유료 서비스로 제공됩니다.
            <br />
            결과가 마음에 들었나요? 친구와 공유해서 함께 행운을 나눠보세요! 📱💙
          </p>
          {isMounted && (
            <Link href={getTarget("/dream")} legacyBehavior>
              <a className="mt-8 block px-8 py-3 bg-yellow-400 text-indigo-800 font-bold text-lg rounded-full hover:bg-yellow-500 transition">
                무료로 꿈 해몽 받기
              </a>
            </Link>
          )}
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">📱 친구와 공유해서 함께 행운을 나눠보세요!</h3>
          {isMounted && (
            <Link href={getTarget("/dream")} legacyBehavior>
              <a className="mt-8 block px-8 py-3 bg-white text-indigo-800 font-bold rounded-full border border-white hover:bg-indigo-600 hover:text-white transition">
                친구와 공유하기
              </a>
            </Link>
          )}
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        &copy; 2025 MongMe. All rights reserved.
        <div className="mt-2 space-x-4">
          <Link href="/terms" legacyBehavior>
            <a className="hover:underline">이용 약관</a>
          </Link>
          <Link href="/privacy" legacyBehavior>
            <a className="hover:underline">개인정보 처리방침</a>
          </Link>
        </div>
        <div className="mt-4">
          <p>(주)엔루트엠코리아</p>
          <p>(12739) 경기 광주시 행정타운로 6-3, 702호</p>
          <p>대표: 이동구</p>
          <p>개인정보관리책임자: 이강석</p>
          <p>사업자등록번호: 885-87-01492</p>
          <p>통신판매번호: 2021-경기광주-2271</p>
          <p>이메일: contact@nrootm.com</p>
        </div>
      </footer>
    </div>
  );
}
