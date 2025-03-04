import { useEffect, useState } from "react";
import { getDoc, doc, updateDoc, collection, getDocs, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [editField, setEditField] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const router = useRouter();

  // ✅ 사용자 데이터 및 최근 해몽 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const genderMap = {
            male: "남",
            female: "여",
          };
          data.gender = genderMap[data.gender] || data.gender;

          setUserData(data);
          setUpdatedData(data);
        }

        const dreamsRef = collection(db, "dreams");
        const dreamsQuery = query(
          dreamsRef,
          where("userId", "==", user.uid),       // 현재 사용자의 꿈 기록만 가져오기
          orderBy("createdAt", "desc"),            // 최신순(내림차순) 정렬
          limit(3)                                 // 최대 3개만 가져오기
        );
        
        const dreamsSnap = await getDocs(dreamsQuery);
        const dreamsList = dreamsSnap.docs.map((doc) => doc.data());
        setDreams(dreamsList);        
      } catch (error) {
        console.error("❌ 사용자 데이터 불러오기 실패:", error);
      }
    };

    fetchUserData();
  }, [router, user]);

  // ✅ 생년월일 및 태어난 시간 입력 형식 자동화
  const handleFormattedChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === "birthdate") {
      formattedValue = value.replace(/\D/g, "").slice(0, 8);
      if (formattedValue.length >= 4) formattedValue = formattedValue.slice(0, 4) + "-" + formattedValue.slice(4);
      if (formattedValue.length >= 7) formattedValue = formattedValue.slice(0, 7) + "-" + formattedValue.slice(7);
    } else if (name === "birthtime") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 2) formattedValue = formattedValue.slice(0, 2) + ":" + formattedValue.slice(2);
    }

    setUpdatedData((prevData) => ({ ...prevData, [name]: formattedValue }));
  };

  const handleEdit = (field) => setEditField(field);

  const handleSave = async (field) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [field]: updatedData[field],
      });
      setUserData((prevData) => ({ ...prevData, [field]: updatedData[field] }));
      setEditField(null);
      alert("✅ 정보가 수정되었습니다.");
    } catch (error) {
      console.error("❌ 정보 수정 실패:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("로그아웃 전 localStorage user:", localStorage.getItem("user"));
      await signOut(auth);
      localStorage.removeItem("user");
      console.log("로그아웃 후 localStorage user:", localStorage.getItem("user"));
      window.location.href = "/"; // 메인 페이지로 이동하면서 새로고침
      // router.push("/");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };  
  
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmDelete) return;
  
    try {
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);
      
      // Firebase Auth의 현재 사용자 인스턴스를 가져와서 deleteUser를 호출합니다.
      const firebaseUser = auth.currentUser;
      if (firebaseUser && typeof firebaseUser.delete === "function") {
        await deleteUser(firebaseUser);
      } else {
        // Firebase Auth의 User 인스턴스가 없으면(예: 커스텀 로그인) 삭제 건너뛰기
        console.warn("Firebase user instance is not available; skipping Firebase Auth deletion.");
      }
      
      alert("✅ 계정이 삭제되었습니다.");
      window.location.href = "/"; // 메인 페이지로 이동하면서 새로고침
    } catch (error) {
      console.error("❌ 계정 삭제 실패:", error);
      alert("계정 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!userData) return <p className="text-center mt-10">⏳ 정보를 불러오는 중...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <img src="/images/MongMe_logo02.png" alt="MongMe 로고" className="w-80 h-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">{userData.name} 님의 개인정보</h1>
        </div>

        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">1. 기본 정보</h2>
          <div className="space-y-3">
            <p>이름: {userData.name}</p>
            <p>이메일: {userData.email}</p>

            <div className="flex items-center gap-3">
              <p>생년월일: </p>
              {editField === "birthdate" ? (
                <input
                  type="text"
                  name="birthdate"
                  value={updatedData.birthdate}
                  onChange={handleFormattedChange}
                  placeholder="YYYY-MM-DD"
                  className="border p-1 rounded"
                />
              ) : (
                <span>{userData.birthdate}</span>
              )}
              {editField === "birthdate" ? (
                <button onClick={() => handleSave("birthdate")} className="text-blue-500 ml-2">
                  저장
                </button>
              ) : (
                <button onClick={() => handleEdit("birthdate")} className="text-blue-500 ml-2">
                  수정
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <p>태어난 시간: </p>
              {editField === "birthtime" ? (
                <input
                  type="text"
                  name="birthtime"
                  value={updatedData.birthtime}
                  onChange={handleFormattedChange}
                  placeholder="HH:MM"
                  className="border p-1 rounded"
                />
              ) : (
                <span>{userData.birthtime || "정보 없음"}</span>
              )}
              {editField === "birthtime" ? (
                <button onClick={() => handleSave("birthtime")} className="text-blue-500 ml-2">
                  저장
                </button>
              ) : (
                <button onClick={() => handleEdit("birthtime")} className="text-blue-500 ml-2">
                  수정
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <p>MBTI: </p>
              {editField === "mbti" ? (
                <input
                  type="text"
                  name="mbti"
                  value={updatedData.mbti}
                  onChange={(e) => setUpdatedData((prevData) => ({ ...prevData, mbti: e.target.value }))}
                  className="border p-1 rounded"
                />
              ) : (
                <span>{userData.mbti}</span>
              )}
              {editField === "mbti" ? (
                <button onClick={() => handleSave("mbti")} className="text-blue-500 ml-2">
                  저장
                </button>
              ) : (
                <button onClick={() => handleEdit("mbti")} className="text-blue-500 ml-2">
                  수정
                </button>
              )}
            </div>

            <p>성별: {userData.gender}</p>
          </div>
        </div>

        {/* ✅ 해몽 및 보너스 정보 */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">2. 해몽 및 보너스 정보</h2>
          <p>이번 주 행운 번호: {userData.luckyNumber || "정보 없음"}</p>
          <p>오늘 보너스 찬스: {userData.bonusChance || 0}회</p>
          <p className="text-green-600 font-bold mt-2">유료 해몽 가능 횟수: {userData.premiumBonusChance || 0}회</p>

          <div className="mt-4">
            {userData.premiumBonusChance > 0 ? (
              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/premium-dream")}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  💎 유료 꿈 해몽 바로가기
                </button>
                <button
                  onClick={() => router.push("/premium-result")}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  📜 유료 꿈 해몽 결과 보기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-red-500">
                  💳 유료 해몽을 이용하려면 먼저 결제하세요.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push("/premium-payment")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  >
                    🔋 유료 해몽 충전
                  </button>
                  <button
                    onClick={() => router.push("/premium-result")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    📜 유료 꿈 해몽 결과 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ 최근 해몽 기록 (최신 3개만) */}
        {dreams.length > 0 && (
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">3. 최근 해몽 기록 (최대 3개)</h2>
            {dreams.map((dream, index) => (
              <div key={index} className="mb-3 p-3 border rounded bg-gray-100">
                <p>꿈 내용: {dream.dreamText}</p>
                <p className="mt-1">해몽 결과: {dream.interpretation}</p>
                <p className="text-gray-500 text-sm">
                  작성일: {new Date(dream.createdAt.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => router.push("/")} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            홈으로
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            로그아웃
          </button>
          <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800">
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
