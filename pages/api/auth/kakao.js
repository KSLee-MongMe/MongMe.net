// ✅ pages/api/auth/kakao.js

const getKakaoUser = async (accessToken) => {
    try {
      const response = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      if (!response.ok) {
        throw new Error("❌ 카카오 사용자 정보 요청 실패");
      }
  
      const data = await response.json();
      if (!data.id) {
        throw new Error("❌ 카카오 로그인 오류: 사용자 ID 없음");
      }
  
      return {
        id: data.id.toString(), // Firebase에서 문자열 ID 사용
        email: data.kakao_account?.email || "이메일 없음",
        name: data.kakao_account?.profile?.nickname || "이름 없음",
        profileImage: data.kakao_account?.profile?.profile_image_url || "",
      };
    } catch (error) {
      console.error("❌ 카카오 사용자 정보 가져오기 실패:", error);
      throw error;
    }
  };
  
  // ✅ API 엔드포인트 (클라이언트에서 요청)
  export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "❌ 지원되지 않는 요청 방식입니다." });
    }
  
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "❌ accessToken이 필요합니다." });
    }
  
    try {
      // ✅ 카카오 사용자 정보 가져오기
      const userData = await getKakaoUser(accessToken);
  
      if (!userData.id) {
        throw new Error("❌ 카카오 사용자 ID가 없습니다.");
      }
  
      // ✅ 클라이언트에서 Firebase Auth 또는 Local Storage에 저장할 수 있도록 데이터 반환
      return res.status(200).json(userData);
    } catch (error) {
      console.error("❌ 카카오 로그인 처리 실패:", error);
      return res.status(500).json({ error: "카카오 로그인 처리 실패" });
    }
  }
  