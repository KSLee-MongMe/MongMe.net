import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query; // 요청된 문서 ID 받기
  if (!id) {
    return res.status(400).json({ error: "Missing dream ID" });
  }

  try {
    const docRef = doc(db, "dreams", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Dream not found" });
    }

    return res.status(200).json(docSnap.data()); // Firestore 데이터 반환
  } catch (error) {
    console.error("❌ Firestore 문서 가져오기 실패:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
