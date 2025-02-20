module.exports = {
    reactStrictMode: true,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
    },
  };
  
/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // ✅ ESLint 검사 비활성화
    },
  };
  
  module.exports = nextConfig;
  