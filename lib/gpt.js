import OpenAI from "openai";

// ✅ 환경 변수에서 API 키 및 모델 가져오기
console.log("✅ OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "OK" : "MISSING");
console.log("✅ OPENAI_MODEL:", process.env.OPENAI_MODEL || "gpt-4o-mini");

// 🔹 OpenAI 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 🔹 브라우저에서 직접 API 호출 가능하도록 설정
});

// 🔹 환경 변수에서 모델 지정 (기본값: gpt-4o-mini)
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * ✅ 사용자 맞춤형 꿈 해몽 제공
 * @param {string} dreamText - 사용자가 입력한 꿈 내용
 * @param {string} birthdate - 사용자 생년월일 (YYYY-MM-DD)
 * @param {string} mbti - 사용자 MBTI 유형 (선택)
 * @returns {Promise<string>} - GPT-4o-mini가 생성한 해몽 결과
 */
export const interpretDream = async (dreamText, birthdate, mbti) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,  // 🔹 설정된 모델 사용 (기본값: gpt-4o-mini)
      messages: [
        { role: "system", content: "당신은 꿈 해몽 전문가입니다. 사용자의 생년월일과 MBTI를 고려하여 맞춤형 해몽을 제공합니다." },
        { role: "user", content: `내 생년월일: ${birthdate}, MBTI: ${mbti || "모름"}\n꿈 내용: ${dreamText}\n이 꿈이 나에게 어떤 의미가 있을까요? 간략하고 명확하게 설명해 주세요. (최대 300토큰 이내)` }
      ],
      max_tokens: 300,  // 🔹 AI 응답이 300 토큰을 넘지 않도록 제한
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ GPT API 호출 실패 (${model}):`, error);
    return "AI 해몽을 생성하는 데 실패했습니다.";
  }
};

/**
 * ✅ 꿈을 기반으로 행운의 색깔 추천
 * @param {string} dreamText - 사용자가 입력한 꿈 내용
 * @returns {Promise<string>} - GPT-4o-mini가 추천한 행운의 색깔
 */
export const getLuckyColor = async (dreamText) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "당신은 점성술 및 심리학 전문가입니다. 사용자의 꿈을 분석하여 행운의 색깔을 추천합니다." },
        { role: "user", content: `꿈 내용: ${dreamText}\n이 꿈에 어울리는 행운의 색깔을 추천해주세요. (간결하게 1~2 단어로 답변)` }
      ],
      max_tokens: 50,  // 🔹 응답을 간결하게 제한 (1~2 단어)
      temperature: 0.6,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ 행운 색깔 추천 실패:", error);
    return "알 수 없음"; // 🔹 오류 발생 시 기본값 반환
  }
};
