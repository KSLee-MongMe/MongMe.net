// lib/gpt.js
import OpenAI from "openai";

// ✅ 서버 환경에서만 실행되도록 보장
if (typeof window !== "undefined") {
  throw new Error("❌ lib/gpt.js는 클라이언트에서 실행될 수 없습니다.");
}

// ✅ 환경 변수 확인 (서버에서만 사용 가능)
console.log("✅ OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "OK" : "MISSING");
console.log("✅ OPENAI_MODEL:", process.env.OPENAI_MODEL || "gpt-4o-mini");

// 🔹 OpenAI 인스턴스 생성 (서버 전용)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// 🔹 환경 변수에서 모델 지정 (기본값: gpt-4o-mini)
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";


// ----------------------------------------------------
// ✅ 일반 해몽: 사용자의 생년월일과 MBTI를 고려한 300토큰 이내의 해몽
// ----------------------------------------------------
export const interpretDream = async (dreamText, birthdate, mbti) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "당신은 꿈 해몽 전문가입니다. 사용자의 생년월일과 MBTI를 고려하여 맞춤형 해몽을 제공합니다.",
        },
        {
          role: "user",
          content: `내 생년월일: ${birthdate}, MBTI: ${mbti || "모름"}\n꿈 내용: ${dreamText}\n이 꿈이 나에게 어떤 의미가 있을까요? 간략하고 명확하게 설명해 주세요. (최대 300토큰 이내)`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ GPT API 호출 실패 (${model}):`, error);
    throw new Error("AI 해몽을 생성하는 데 실패했습니다.");
  }
};


// ----------------------------------------------------
// ✅ 행운의 색깔 추천: 사용자의 꿈을 분석하여 1~2 단어로 색깔을 반환
// ----------------------------------------------------
export const getLuckyColor = async (dreamText) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "당신은 점성술 및 심리학 전문가입니다. 사용자의 꿈을 분석하여 행운의 색깔을 추천합니다.",
        },
        {
          role: "user",
          content: `꿈 내용: ${dreamText}\n이 꿈에 어울리는 행운의 색깔을 한가지 색으로 추천해주세요. (간결하게 1~2 단어로 답변)`,
        },
      ],
      max_tokens: 50,
      temperature: 0.6,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ 행운 색깔 추천 실패:", error);
    throw new Error("행운의 색깔을 가져오는 데 실패했습니다.");
  }
};

// ----------------------------------------------------
// ✅ MBTI 성향 요약 (200토큰)
// ----------------------------------------------------
export const interpretMBTI = async (mbti) => {
  try {
    console.log("⏳ MBTI 분석 중...");
    const responseMBTI = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "당신은 MBTI 성격 분석 전문가입니다. 사용자의 MBTI 유형을 170토큰 이내로 요약해 주세요.",
        },
        {
          role: "user",
          content: `사용자의 MBTI 유형: ${mbti}\n해당 성향의 핵심 특성을 간단히 설명해 주세요.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const mbtiSummary = responseMBTI.choices[0].message.content.trim();
    console.log("✅ MBTI 분석 완료");
    return mbtiSummary;
  } catch (error) {
    console.error("❌ MBTI 성향 실패:", error);
    return "MBTI 요약 없음";
  }
};

// ----------------------------------------------------
// ✅ 사주 요약 (200토큰, 생년월일 + 태어난 시간 포함)
// ----------------------------------------------------
export const interpretSaju = async (birthdate, birthtime) => {
  try {
    console.log("⏳ 사주 분석 중...");

    // ✅ 현재 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split("T")[0];

    const responseSaju = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "당신은 사주 분석 전문가입니다. 사용자의 생년월일과 태어난 시간을 기반으로 특정 날짜의 사주를 170토큰 이내로 요약해 주세요.",
        },
        {
          role: "user",
          content: `사용자의 생년월일: ${birthdate}, 태어난 시간: ${birthtime || "정보 없음"}\n오늘 날짜: ${today}\n오늘 날짜를 기준으로 이번 달의 사주를 요약해 주세요.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const sajuSummary = responseSaju.choices[0].message.content.trim();
    console.log("✅ 사주 분석 완료:", sajuSummary);
    return sajuSummary;
  } catch (error) {
    console.error("❌ 사주 요약 실패:", error);
    return "사주 요약 없음";
  }
};

// ----------------------------------------------------
// ✅ 프리미엄 해몽: MBTI 요약, 사주 요약, 그리고 해몽 결과 (1000토큰)
// ----------------------------------------------------
export const interpretPremiumDream = async (dreamText, birthdate, birthtime, mbti) => {
  try {
    console.log("⏳ MBTI와 사주 분석 시작...");
    const [mbtiSummary, sajuSummary] = await Promise.all([
      interpretMBTI(mbti),
      interpretSaju(birthdate, birthtime),
    ]);
    console.log("✅ MBTI와 사주 분석 완료");

    let interpretation;
    try {
      console.log("⏳ 해몽 분석 중...");
      const responseDream = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "당신은 전문적인 꿈 해몽가입니다. 사용자의 사주와 MBTI 성향을 바탕으로 꿈의 의미를 자세히 설명해 주세요.",
          },
          {
            role: "user",
            content: `사주 요약: ${sajuSummary}\nMBTI 요약: ${mbtiSummary}\n꿈 내용: ${dreamText}\n이 정보를 종합하여 꿈에 대한 해몽 결과를 900토큰 이내로 자세히 설명해 주세요.`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      interpretation = responseDream.choices[0].message.content.trim();
      console.log("🔥 interpretation 반환 전의 타입:", typeof interpretation, interpretation); // ✅ 최종 반환 직전 로그 추가
      console.log("✅ 해몽 분석 완료");
    } catch (error) {
      console.error("❌ 해몽 실패:", error);
      interpretation = "자세한 해몽 결과를 가져올 수 없습니다.";
    }

    console.log("⏳ 행운 번호 추출 중...");
    const luckyNumbers = getPremiumLuckyNumbers();
    console.log("✅ 행운 번호 추출 완료");

    return {
      interpretation,
      mbtiSummary,
      sajuSummary,
      luckyNumbers,
    };
  } catch (error) {
    console.error("❌ 프리미엄 해몽 실패:", error);
    throw new Error("프리미엄 AI 해몽을 생성하는 데 실패했습니다.");
  }
};

// ----------------------------------------------------
// ✅ 프리미엄 행운번호 제공 (로또 형식 6개씩 2세트)
// ----------------------------------------------------
export const getPremiumLuckyNumbers = () => {
  const generateLuckySet = () => {
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b).join(", ");
  };

  return [generateLuckySet(), generateLuckySet()];
};