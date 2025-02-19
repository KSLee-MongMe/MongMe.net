import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content="몽미 - 나의 꿈 해몽" />
        <meta property="og:description" content="AI가 해석한 나의 꿈 해몽과 이번 주 행운의 색깔과 번호를 확인하세요!" />
        <meta property="og:image" content="/share-image.png" />
        <meta property="og:url" content="https://mongme.net" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
