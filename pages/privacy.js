// import Link from "next/link";
import { useRouter } from "next/router";

export default function Privacy() {
  const router = useRouter();
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">몽미 (mongme.net) 개인정보 이용방침</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 1 조 (목적)</h2>
        <p>
          본 개인정보 이용방침은 mongme.net (이하 ‘사이트’)가 이용자의 개인정보를 수집, 사용, 관리 및 보호하는 방법과 이용자의 권리를 안내하기 위해 작성되었습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 2 조 (수집하는 개인정보의 항목 및 목적)</h2>
        <p className="mb-2"><strong>수집 항목</strong></p>
        <p>
          필수 정보: 이름, 이메일, 생년월일, 태어난 시간, 성별, MBTI
        </p>
        <p>
          자동 수집 정보: 로그인 기록, IP 주소, 서비스 이용 기록, 쿠키 정보 (필요 시)
        </p>
        <p>
          결제 시: 결제 수단 정보(간편결제 이용 시 해당 서비스 제공자에 의해 처리되며, 사이트는 이를 직접 수집하지 않음)
        </p>
        <p className="mt-2 mb-2"><strong>수집 목적</strong></p>
        <p>
          회원 관리: 로그인 및 회원 식별, 불법 사용 방지, 회원 서비스 제공
        </p>
        <p>
          서비스 제공: AI 꿈 해몽, 행운번호 및 행운의 색상 제공, 이미지 다운로드 및 SNS 공유 기능 제공
        </p>
        <p>
          유료 서비스 결제 처리 및 고객 문의 응대
        </p>
        <p>
          서비스 개선 및 개인 맞춤형 콘텐츠 제공
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 3 조 (개인정보의 수집 방법)</h2>
        <p>
          회원가입 시 구글, 네이버, 카카오 소셜 로그인을 통해 기본 정보를 수집하며, 추가 개인정보는 사용자가 직접 입력합니다.
        </p>
        <p>
          서비스 이용 과정에서 자동으로 생성 및 수집되는 정보가 포함될 수 있습니다.
        </p>
        <p>
          유료 서비스 이용 시 토스페이먼트 등의 결제 서비스 제공업체를 통해 결제 정보가 처리됩니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 4 조 (개인정보의 보유 및 이용 기간)</h2>
        <p>
          개인정보는 회원 탈퇴 시 즉시 파기되며, 다음의 경우에 한해 일정 기간 동안 보관될 수 있습니다.
        </p>
        <p>
          계약 또는 청약철회에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)
        </p>
        <p>
          대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)
        </p>
        <p>
          소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자 보호에 관한 법률)
        </p>
        <p>
          이용자의 개인정보는 목적이 달성되면 지체 없이 파기합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 5 조 (개인정보의 제3자 제공 및 위탁)</h2>
        <p>
          사이트는 이용자의 개인정보를 사전 동의 없이 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.
        </p>
        <p>
          법령에 따라 요구되는 경우
        </p>
        <p>
          이용자의 사전 동의가 있는 경우
        </p>
        <p>
          서비스 제공을 위해 필요한 경우(예: 결제 처리 시 토스페이먼트에 필요한 정보 제공)
        </p>
        <p className="mt-2 mb-2"><strong>위탁업체 및 위탁업무</strong></p>
        <p>
          토스페이먼트(Toss Payments): 결제 처리 및 관련 서비스 제공
        </p>
        <p>
          OpenAI: AI 해몽 서비스 제공을 위한 데이터 처리 (단, 개인식별 정보는 제공되지 않음)
        </p>
        <p>
          Firebase (Google): 회원 정보 및 서비스 이용 기록 저장, 사용자 인증
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 6 조 (개인정보의 보호를 위한 기술적 및 관리적 조치)</h2>
        <p className="mb-2"><strong>기술적 보호조치:</strong></p>
        <p>
          개인정보는 암호화하여 저장 및 관리됩니다.
        </p>
        <p>
          외부의 해킹 및 악성코드로부터 보호하기 위해 보안 소프트웨어를 사용합니다.
        </p>
        <p className="mt-2 mb-2"><strong>관리적 보호조치:</strong></p>
        <p>
          개인정보 접근 권한을 최소한의 인원으로 제한합니다.
        </p>
        <p>
          개인정보 처리 담당자를 대상으로 정기적인 교육을 실시합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 7 조 (쿠키 사용 및 관리)</h2>
        <p>
          사이트는 사용자 경험을 개선하기 위해 쿠키를 사용할 수 있습니다.
        </p>
        <p>
          이용자는 브라우저 설정을 통해 쿠키 사용을 거부하거나 삭제할 수 있습니다. 단, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 8 조 (이용자의 권리 및 행사 방법)</h2>
        <p>
          이용자는 언제든지 본인의 개인정보에 대한 열람, 수정 및 삭제를 요청할 수 있습니다.
        </p>
        <p>
          개인정보 관련 요청은 사이트의 고객센터 또는 이메일을 통해 접수되며, 접수 즉시 처리됩니다.
        </p>
        <p>
          이용자는 개인정보의 수집 및 사용에 대한 동의를 철회할 수 있으며, 동의 철회 시 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 9 조 (개인정보 보호책임자 및 연락처)</h2>
        <p>
          개인정보 보호책임자: [이강석 매니저]
        </p>
        <p>
          이메일: [klee@nrootm.com]
        </p>
        <p>
          문의사항은 이메일을 통해 접수해 주시기 바랍니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">제 10 조 (개인정보 이용방침의 변경)</h2>
        <p>
          본 개인정보 이용방침은 법령의 변경 또는 서비스 정책의 변경에 따라 수정될 수 있습니다.
        </p>
        <p>
          변경 시 최소 7일 전에 사이트를 통해 공지하며, 중요한 변경 사항은 사전에 통지합니다.
        </p>
      </section>

      <section className="mb-6">
        <p>본 개인정보 이용방침은 2025년 2월 23일부터 적용됩니다.</p>
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
