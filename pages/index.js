import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 text-white">
      {/* ✅ 헤더 */}
      <header className="flex justify-between items-center p-6 bg-indigo-800 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">夢ME</h1>
        <div className="flex gap-4">
          <Link href="/login" passHref>
            <button className="px-4 py-2 border border-white rounded hover:bg-white hover:text-indigo-800 transition">
              SIGN IN
            </button>
          </Link>
          <Link href="/login" passHref>
            <button className="px-4 py-2 bg-white text-indigo-800 rounded hover:bg-indigo-600 hover:text-white transition">
              SIGN UP
            </button>
          </Link>
        </div>
      </header>

      {/* ✅ 메인 콘텐츠 */}
      <main className="flex flex-col items-center text-center px-6 py-12 space-y-8">
        <h2 className="text-4xl font-extrabold leading-snug">
          어젯밤 당신이 꾼 그 꿈, <br /> 오늘 나에게 행운을 가져다줄까? 🌙✨
        </h2>

        <p className="text-lg max-w-2xl">
          꿈은 그냥 스쳐가는 상상이 아니에요.
          <br />
          어쩌면 당신의 성격과 어울린 특별한 행운을 가져다줄 신호일지도 몰라요.
          <br />
          🐷 돼지를 봤다고 무조건 복이 오는 건 아니고, 🐍 뱀을 봤다고 나쁜 일만 생기는 것도 아니죠.
          <br />
          누구에게는 행운의 징조가, 또 누구에게는 경고일 수도 있으니까요!
          <br />
          지금 바로 AI로 꿈을 해몽해보고, 당신에게 다가올 행운까지 확인해보세요! 🎉
          <br />
          혹시 몰라요. 오늘이 바로 복권을 사야 하는 날일지도요! 💸✨
        </p>

        <Link href="/login" passHref>
          <button className="mt-6 px-8 py-3 bg-yellow-400 text-indigo-800 font-bold text-lg rounded-full hover:bg-yellow-500 transition">
            ✨ 지금 바로 시작해보세요!
          </button>
        </Link>

        {/* ✅ 서비스 기능 소개 */}
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
            <h3 className="text-xl font-bold">🍀 이번주의 행운 번호</h3>
            <p>당신에게 다가올 행운의 숫자도 함께 알아보세요!</p>
          </div>
        </div>

        {/* ✅ 사용자 사례 */}
        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">💬 다른 사람들은 이런 꿈을 꿨어요!</h3>
          <div className="space-y-4">
            <p>🐷🐶 <strong>돼지랑 개가 싸우는 꿈</strong> – 이거 돼지꿈이야, 개꿈이야? 결과에 따라 복권 사러 갈지 고민 중!</p>
            <p>🎓📚 <strong>시험 보는데 문제지가 외계어야!</strong> – 이건 성적이 오를 신호일까, 공부하란 경고일까?</p>
            <p>💣🎉 <strong>폭탄이 터졌는데 폭탄에서 폭죽이 나왔어</strong> – 예상치 못한 깜짝 행운이 곧 찾아온다는데?!</p>
            <p>🚗🐌 <strong>차를 몰고 가는데 거북이보다 느려 ☹</strong> – 답답했던 일이 엄청 빠르게 풀릴거라는데?!</p>
          </div>
        </section>

        {/* ✅ 무료 사용 및 유료 서비스 안내 */}
        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">🚀 무료로 시작하고, 더 깊이 알고 싶다면?</h3>
          <p className="max-w-2xl mx-auto">
            무료로 매일 아침 당신의 꿈을 풀어보세요.
            <br />
            더 구체적인 해석과 맞춤 운세는 유료 서비스로 제공됩니다.
            <br />
            결과가 마음에 들었다면 친구와 공유해서 함께 행운을 나눠보세요! 📱💙
          </p>
          <Link href="/login" passHref>
            <button className="mt-6 px-8 py-3 bg-yellow-400 text-indigo-800 font-bold text-lg rounded-full hover:bg-yellow-500 transition">
              무료로 꿈 해몽 받기
            </button>
          </Link>
        </section>

        {/* ✅ 친구와 공유하기 */}
        <section className="mt-12 space-y-6">
          <h3 className="text-3xl font-bold">📱 친구와 공유해서 함께 행운을 나눠보세요!</h3>
          <Link href="/login" passHref>
            <button className="px-6 py-3 bg-white text-indigo-800 font-bold rounded-full border border-white hover:bg-indigo-600 hover:text-white transition">
              친구와 공유하기
            </button>
          </Link>
        </section>
      </main>

      {/* ✅ 푸터 */}
      <footer className="text-center py-6 text-sm text-gray-400">
        &copy; 2025 MongMe. All rights reserved.
      </footer>
    </div>
  );
}
