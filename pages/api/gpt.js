// pages/api/gpt.js
import { interpretDream, getLuckyColor } from "../../lib/gpt";

export default async function handler(req, res) {
  try {
    // ✅ 환경 변수 확인 (서버에서만 실행됨)
    console.log("✅ OPENAI_API_KEY (server):", process.env.OPENAI_API_KEY ? "OK" : "MISSING");
    console.log("✅ OPENAI_MODEL (server):", process.env.OPENAI_MODEL || "gpt-4o-mini");

    if (req.method === "POST") {
      const { action, dreamText, birthdate, mbti } = req.body;

      if (!dreamText) {
        return res.status(400).json({ error: "dreamText는 필수입니다." });
      }

      let result;
      switch (action) {
        case "interpretDream":
          result = await interpretDream(dreamText, birthdate, mbti);
          break;
        case "getLuckyColor":
          result = await getLuckyColor(dreamText);
          break;
        default:
          return res.status(400).json({ error: "유효하지 않은 action입니다." });
      }

      return res.status(200).json({ result });
    } else {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("❌ API 요청 실패:", error.message);
    return res.status(500).json({ error: "서버에서 API 호출 중 오류가 발생했습니다." });
  }
}
