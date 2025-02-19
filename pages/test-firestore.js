import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function TestFirestore() {
  const handleSave = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        userId: "test123",
        name: "테스트 사용자",
        email: "test@example.com",
        createdAt: Timestamp.now()  // 🔹 타임스탬프 데이터 저장
      });
      console.log("🔥 Firestore 저장 성공! 문서 ID:", docRef.id);
    } catch (error) {
      console.error("❌ Firestore 저장 실패:", error);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Firestore 테스트</h1>
      <button onClick={handleSave} className="bg-blue-500 text-white p-2 mt-4">
        Firestore에 데이터 저장 테스트
      </button>
    </div>
  );
}
