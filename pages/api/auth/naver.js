import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from "firebase/auth";

/**
 * 🔹 네이버 OAuth: 인증 코드로 Access Token 요청
 */
const getNaverAccessToken = async (code) => {
  try {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("❌ 환경 변수(NAVER API 설정)가 올바르게 설정되지 않았습니다.");
    }

    console.log("🔄 네이버 Access Token 요청 시작");
    const response = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}`,
      { method: "POST" }
    );

    const data = await response.json();
    console.log("✅ 네이버 Access Token 응답:", data);

    if (!response.ok || data.error) {
      throw new Error(`❌ 네이버 Access Token 요청 실패: ${data.error_description || "알 수 없는 오류"}`);
    }

    return data.access_token;
  } catch (error) {
    console.error("❌ 네이버 Access Token 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 🔹 네이버 API를 사용하여 사용자 정보 가져오기
 */
const getNaverUser = async (accessToken) => {
  try {
    console.log("🔄 네이버 사용자 정보 요청 시작");
    const response = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    console.log("✅ 네이버 사용자 정보 응답:", data);

    if (!response.ok || data.resultcode !== "00") {
      throw new Error(`❌ 네이버 로그인 오류: ${data.message || "사용자 정보 요청 실패"}`);
    }

    return data.response; // { id, email, name, profile_image }
  } catch (error) {
    console.error("❌ 네이버 사용자 정보 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 🔹 Firestore에서 사용자 확인 및 Firebase 로그인 처리
 */
const createOrGetFirestoreUser = async (naverUserData) => {
  const auth = getAuth();
  const email = naverUserData.email || `${naverUserData.id}@example.com`;
  const password = naverUserData.id;

  console.log("🔄 Firestore 사용자 데이터 확인 중...");
  let firebaseUser;
  let isNewUser = false;

  try {
    // 기존 사용자 여부 확인 (Firebase Auth 기준)
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      console.log("✅ 기존 Firebase 사용자 존재함 → 로그인 시도");
      firebaseUser = await signInWithEmailAndPassword(auth, email, password);
    } else {
      console.log("✅ 새로운 Firebase 사용자 등록 시작");
      try {
        firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          console.log("⚠️ 이메일 중복 감지 - 기존 사용자로 로그인 시도");
          firebaseUser = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw error;
        }
      }
    }

    // Firestore 문서를 Firebase UID 기준으로 확인 (서버에서 최신 데이터 읽기)
    const userRef = doc(db, "users", firebaseUser.user.uid);
    const userSnap = await getDoc(userRef, { source: "server" });
    if (!userSnap.exists()) {
      // 신규 사용자: Firestore 문서가 없으므로 생성할 때 signupCompleted 필드를 false로 설정
      isNewUser = true;
      await setDoc(userRef, {
        userId: firebaseUser.user.uid,
        name: naverUserData.name || "이름 없음",
        email: email,
        loginProvider: "Naver",
        createdAt: new Date().toISOString(),
        signupCompleted: false, // 가입 완료 여부 플래그 (신규 사용자)
      });
      console.log("✅ Firestore에 신규 사용자 정보 저장 완료!");
    } else {
      // 문서가 존재하면, 가입 완료 여부를 체크
      const docData = userSnap.data();
      if (docData.signupCompleted !== true) {
        isNewUser = true;
        console.log("✅ Firestore에 기존 사용자 문서 있으나, signupCompleted가 false → 신규 사용자로 판단");
      } else {
        console.log("✅ Firestore에 기존 사용자 정보 존재 (signupCompleted true)");
      }
    }
  } catch (error) {
    console.error("❌ Firebase Auth 처리 중 오류 발생:", error);
    throw error;
  }

  return {
    uid: firebaseUser.user.uid,
    email: firebaseUser.user.email,
    displayName: naverUserData.name,
    photoURL: naverUserData.profile_image,
    isNewUser, // 신규 사용자 여부 플래그
  };
};

/**
 * 🔹 API 엔드포인트: 클라이언트가 요청하면 실행됨
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ 지원되지 않는 요청 방식입니다." });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "❌ OAuth 인증 코드가 필요합니다." });
  }

  try {
    console.log("🔄 네이버 로그인 처리 시작");

    // 네이버 Access Token 가져오기
    const accessToken = await getNaverAccessToken(code);

    // 네이버 사용자 정보 가져오기
    const userData = await getNaverUser(accessToken);
    if (!userData.id) {
      throw new Error("❌ 네이버 사용자 ID가 없습니다.");
    }

    // Firestore에 사용자 저장 및 Firebase 로그인 처리
    const firebaseUser = await createOrGetFirestoreUser(userData);
    console.log("✅ 네이버 로그인 최종 성공:", firebaseUser);

    // isNewUser 플래그를 포함하여 클라이언트에 반환
    return res.status(200).json(firebaseUser);
  } catch (error) {
    console.error("❌ 네이버 로그인 처리 실패:", error);
    return res.status(500).json({ error: "네이버 로그인 처리 실패" });
  }
}
