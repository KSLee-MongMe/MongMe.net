/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  },

  eslint: {
    ignoreDuringBuilds: true, // ✅ ESLint 검사 비활성화
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      path: false,
      child_process: false,
    };
    return config;
  },

  // ✅ Body Parser 설정 추가 (수정된 부분)
  api: {
    bodyParser: {
      sizeLimit: '1mb', // 요청의 최대 크기 (필요에 따라 조정 가능)
    },
  },
};

module.exports = nextConfig;  // ✅ 올바른 내보내기
