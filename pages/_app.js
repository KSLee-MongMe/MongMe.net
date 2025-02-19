import { useEffect } from "react";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Kakao SDK가 중복 로드되지 않도록 확인
    if (!window.Kakao) {
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js";
      script.async = true;
      script.onload = () => {
        if (window.Kakao) {
          window.Kakao.init("c2aa4d1a2bec2127bcf21646d6a87b5d"); // 🔹 여기에 발급받은 JavaScript 키 입력
          console.log("✅ Kakao SDK 초기화 완료");
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return <Component {...pageProps} />;
}
