import Link from "next/link";
import { useRouter } from "next/router";

export default function Terms() {
  const router = useRouter();
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">몽미 (mongme.net) 이용약관</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 1 조 (목적)</h2>
        <p>
          본 약관은 mongme.net(이하 '사이트')가 제공하는 GPT API 기반의 꿈 해몽 서비스(이하 '서비스')의 이용과 관련하여 사이트와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 2 조 (용어의 정의)</h2>
        <p>
          '이용자'란 사이트에 접속하여 서비스를 이용하는 자를 의미합니다.
        </p>
        <p>
          '회원'이란 소셜 로그인(구글, 네이버, 카카오)을 통해 회원가입을 완료한 자로, 사이트가 제공하는 서비스를 지속적으로 이용할 수 있는 자를 의미합니다.
        </p>
        <p>
          '개인정보'란 이름, 이메일, 생년월일, 성별, MBTI 등 회원이 제공하는 정보를 의미합니다.
        </p>
        <p>
          'AI 해몽 서비스'란 이용자가 입력한 꿈을 OpenAI API를 통해 해석하고 행운번호와 색상을 제공하는 서비스를 의미합니다.
        </p>
        <p>
          '유료 서비스'란 프리미엄 해몽 및 추가 기능을 제공하는 서비스로, 결제가 필요한 서비스를 의미합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 3 조 (약관의 효력 및 변경)</h2>
        <p>
          본 약관은 회원가입 시 이용자가 동의함으로써 효력이 발생합니다.
        </p>
        <p>
          사이트는 약관을 변경할 수 있으며, 변경 시 사전 공지합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 4 조 (서비스의 제공 및 변경)</h2>
        <p>
          사이트는 이용자에게 AI 꿈 해몽 서비스, 행운번호 및 색상 제공, 이미지 다운로드, SNS 공유 및 유료 서비스를 제공합니다.
        </p>
        <p>
          서비스의 내용과 제공 조건은 필요 시 변경될 수 있으며, 변경 시 사전에 고지합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 5 조 (회원가입 및 개인정보 처리)</h2>
        <p>
          회원가입은 구글, 네이버, 카카오 소셜 로그인을 통해 이루어집니다.
        </p>
        <p>
          회원은 개인정보를 정확히 입력해야 하며, 잘못된 정보로 인한 불이익은 본인이 부담합니다.
        </p>
        <p>
          개인정보는 회원의 동의하에 수집되며, 수집 항목은 이름, 이메일, 생년월일, 성별, MBTI 등입니다.
        </p>
        <p>
          개인정보의 보관 및 이용에 대한 사항은 개인정보 보호방침에 따릅니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 6 조 (AI 서비스 이용 시 주의사항)</h2>
        <p>
          AI 해몽 결과는 참고용으로 제공되며, 사용자의 실제 삶에 대한 보증이나 조언이 아닙니다.
        </p>
        <p>
          AI 서비스의 결과에 대한 신뢰성 및 책임은 이용자 본인에게 있으며, 사이트는 이에 대한 법적 책임을 지지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 7 조 (이미지 다운로드 및 저작권)</h2>
        <p>
          이용자는 해몽 결과를 이미지 파일로 다운로드할 수 있으며, 해당 이미지는 개인적인 용도로만 사용할 수 있습니다.
        </p>
        <p>
          사이트의 콘텐츠와 이미지는 저작권법에 따라 보호되며, 상업적 사용 및 무단 복제를 금지합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 8 조 (SNS 공유 및 보너스 기능)</h2>
        <p>
          이용자는 해몽 결과를 이미지로 저장하거나, SNS에 공유함으로써 추가 해몽 기회를 얻을 수 있습니다.
        </p>
        <p>
          SNS 공유 시 수집되는 정보와 보너스 제공 조건은 사전 고지됩니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 9 조 (유료 서비스 및 결제)</h2>
        <p>
          프리미엄 해몽 및 추가 기능은 유료 서비스로 제공되며, 결제를 통해 이용할 수 있습니다.
        </p>
        <p>
          결제는 토스페이먼트 및 기타 간편결제 수단을 통해 이루어지며, 결제 금액 및 절차는 서비스 페이지에 명시됩니다.
        </p>
        <p>
          결제 완료 후에는 원칙적으로 환불이 불가능하며, 예외 사항은 관련 법령에 따릅니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 10 조 (사용자의 권리 및 의무)</h2>
        <p>
          사용자는 서비스를 법률과 본 약관에 따라 사용해야 합니다.
        </p>
        <p>
          사용자는 타인의 계정을 도용하거나 부정한 방법으로 서비스를 이용해서는 안 됩니다.
        </p>
        <p>
          사용자는 개인정보 보호 및 보안에 유의해야 하며, 계정 정보의 관리에 대한 책임은 본인에게 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 11 조 (서비스의 중단 및 제한)</h2>
        <p>
          사이트는 기술적 문제, 점검, 법적 요구사항 등으로 인해 서비스 제공을 일시적으로 중단할 수 있으며, 사전에 고지합니다.
        </p>
        <p>
          사용자가 본 약관을 위반한 경우 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 12 조 (책임의 한계 및 면책 조항)</h2>
        <p>
          사이트는 AI 해몽 결과의 정확성 및 사용에 대해 법적 책임을 지지 않습니다.
        </p>
        <p>
          사이트는 천재지변, 불가항력 등의 사유로 인한 서비스 제공의 장애에 대해 책임을 지지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 13 조 (분쟁 해결 및 관할 법원)</h2>
        <p>
          서비스 이용과 관련하여 발생한 분쟁은 관련 법령에 따라 해결합니다.
        </p>
        <p>
          분쟁에 대한 소송은 사이트의 본사 소재지 관할 법원에서 진행합니다.
        </p>
      </section>

      <section className="mb-6">
        <p>본 약관은 2025년 2월 23일부터 적용됩니다.</p>
      </section>

      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="text-blue-500 underline"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
