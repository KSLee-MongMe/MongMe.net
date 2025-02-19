export default function ShareButtons({ interpretation, imageUrl }) {
    const shareText = `✨ AI 꿈 해몽 ✨\n"${interpretation}"`;

    // ✅ 트위터 공유 (이미지 URL 포함)
    const shareToTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`;
        window.open(url, "_blank");
    };

    // ✅ 페이스북 공유 (이미지 URL 포함)
    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
        window.open(url, "_blank");
    };

    // ✅ 카카오톡 공유 (이미지 URL 포함)
    const shareToKakao = () => {
        if (window.Kakao) {
            window.Kakao.Share.sendDefault({
                objectType: "feed",
                content: {
                    title: "✨ AI 꿈 해몽 ✨",
                    description: interpretation,
                    imageUrl: imageUrl,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
                buttons: [
                    {
                        title: "자세히 보기",
                        link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href,
                        },
                    },
                ],
            });
        } else {
            alert("카카오톡 공유를 위해 스크립트를 로드해주세요.");
        }
    };

    return (
        <div className="mt-4 flex gap-4 justify-center">
            <button onClick={shareToTwitter} className="bg-blue-500 text-white p-2 rounded">
                🐦 트위터 공유
            </button>
            <button onClick={shareToFacebook} className="bg-blue-700 text-white p-2 rounded">
                📘 페이스북 공유
            </button>
            <button onClick={shareToKakao} className="bg-yellow-500 text-black p-2 rounded">
                🟡 카카오톡 공유
            </button>
        </div>
    );
}
