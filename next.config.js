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

  // ✅ Node.js 모듈을 번들링하지 않도록 설정 (child_process 오류 방지)
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      path: false,
      child_process: false,
    };
    return config;
  },
};

module.exports = nextConfig;

// ✅ Body Parser 설정 추가
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // 요청의 최대 크기 (필요에 따라 조정 가능)
    },
  },
};
