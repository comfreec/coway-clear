import { Link } from 'react-router-dom';
import { useState } from 'react';

function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "매트리스 케어 서비스는 얼마나 걸리나요?",
      a: "일반 가정용 매트리스 기준으로 약 30~40분 정도 소요됩니다. 매트리스 크기와 상태에 따라 시간이 달라질 수 있습니다."
    },
    {
      q: "어떤 장비를 사용하나요?",
      a: "전문 UV 살균기, 고온 스팀 클리너, HEPA 필터 진공청소기 등 전문 장비를 사용하여 99.9% 진드기 제거를 보장합니다."
    },
    {
      q: "무료 케어는 몇 번까지 가능한가요?",
      a: "1회 무료 케어 서비스를 제공해드립니다. 서비스 이용 후 정기 케어가 필요하신 경우 별도 상담을 통해 진행 가능합니다."
    },
    {
      q: "모든 종류의 매트리스가 가능한가요?",
      a: "스프링, 메모리폼, 라텍스, 하이브리드 등 대부분의 매트리스 케어가 가능합니다. 특수 소재의 경우 사전에 문의해주세요."
    },
    {
      q: "케어 후 바로 사용할 수 있나요?",
      a: "네, 케어 직후 바로 사용 가능합니다. 건식 케어 방식을 사용하여 건조 시간이 필요없습니다."
    }
  ];

  return (
    <div>
      {/* Hero Section - 개선된 디자인 */}
      <section className="relative bg-gradient-to-br from-coway-blue via-coway-navy to-blue-900 text-white py-12 md:py-24 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-3 md:mb-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-semibold">
            ✨ 건강한 수면의 시작
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
            지금 무료로<br />
            <span className="text-yellow-300">매트리스 케어</span> 받으세요
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
            전문가의 무료 진단부터 99.9% 진드기 제거까지
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8 px-4">
            <Link
              to="/application"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-coway-blue px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg font-bold hover:bg-yellow-300 hover:text-coway-navy transition-all transform hover:scale-105 shadow-xl"
            >
              <span>무료 신청하기</span>
              <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/board"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-white hover:text-coway-blue transition-all"
            >
              후기 보기
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm px-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% 무료</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>전문가 방문</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>리포트 제공</span>
            </div>
          </div>
        </div>
      </section>

      {/* 진드기 위험성 Section - 개선된 디자인 */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-red-100 text-red-600 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
              ⚠️ 주의하세요
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
              왜 매트리스 케어가 필요할까요?
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              매일 밤 우리와 함께하는 매트리스, 과연 안전할까요?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-red-500">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <span className="text-4xl md:text-5xl">🦠</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center">집먼지 진드기의 위험</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                매트리스 7년 사용 시 진드기 및 알레르기 유발물질 농도가
                <strong className="text-red-600"> 극적으로 증가</strong>합니다.
                진드기의 배설물과 사체 잔해가 호흡기로 들어가 각종 알레르기 질환을 유발합니다.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-orange-500">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-5xl">😷</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">심각한 건강 문제</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                알레르기성 비염, 아토피 피부염, 천식의 <strong className="text-orange-600">가장 흔한 원인물질</strong>입니다.
                특히 어린이는 가려움증, 피부질환, 호흡기 질환 발생 위험이 높으며
                만성 질환으로 이어질 수 있습니다.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-yellow-500">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-5xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">관리의 중요성</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                <strong className="text-yellow-600">10명 중 7명</strong>이 매트리스 위생 관리를 하지 않습니다.
                보관·관리가 부실하면 겉은 깨끗해 보여도 내부에
                곰팡이와 진드기가 번식합니다.
              </p>
            </div>
          </div>

          {/* 통계 박스 */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
              <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              매트리스 7년 이상 사용 시 발생하는 문제
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-red-600 mb-2">33%</div>
                <p className="text-gray-700">사용자가 <strong>수면 장애</strong>와 만성 허리 통증 경험</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
                <p className="text-gray-700">진드기 및 알레르기 유발물질 농도 <strong>극적으로 증가</strong></p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-yellow-600 mb-2">68%</div>
                <p className="text-gray-700">습기와 먼지로 인한 <strong>곰팡이 번식</strong> 위험</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 프로세스 - 개선된 타임라인 디자인 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              케어 서비스 프로세스
            </h2>
            <p className="text-xl text-gray-600">
              간편한 4단계로 건강한 수면 환경을 만들어드립니다
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* 연결선 */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-coway-blue to-coway-green transform -translate-y-1/2"></div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { num: 1, icon: "📝", title: "신청", desc: "간편한 온라인 신청으로 시작하세요" },
                  { num: 2, icon: "📞", title: "방문 예약", desc: "편하신 시간에 전문가가 방문합니다" },
                  { num: 3, icon: "🔬", title: "진단 & 케어", desc: "매트리스 상태 진단 후 전문 케어 진행" },
                  { num: 4, icon: "📊", title: "리포트 제공", desc: "케어 전후 상태를 리포트로 제공" }
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-coway-blue to-coway-green text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-xl transform hover:scale-110 transition-transform">
                        {step.num}
                      </div>
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 Section - 개선된 디자인 */}
      <section className="py-20 bg-gradient-to-br from-coway-navy via-blue-900 to-coway-blue text-white relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">신뢰할 수 있는 전문 서비스</h2>
            <p className="text-blue-200 text-lg">수많은 고객들이 선택한 이유</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "99.9%", label: "진드기 제거율", icon: "🦠" },
              { value: "10,000+", label: "케어 완료 고객", icon: "👥" },
              { value: "4.9/5", label: "고객 만족도", icon: "⭐" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center transform hover:scale-105 transition-transform">
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-xl text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - 새로 추가 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-xl text-gray-600">
              궁금하신 사항을 확인해보세요
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-lg pr-8">{faq.q}</span>
                  <svg
                    className={`w-6 h-6 text-coway-blue transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 개선된 디자인 */}
      <section className="py-24 bg-gradient-to-r from-coway-blue via-blue-600 to-coway-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-300 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            지금 바로 무료 케어를 신청하세요
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
            건강한 수면 환경을 위한 첫 걸음을 시작하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/application"
              className="inline-flex items-center justify-center bg-white text-coway-blue px-12 py-5 rounded-full text-xl font-bold hover:bg-yellow-300 hover:text-coway-navy transition-all transform hover:scale-105 shadow-2xl"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              무료 신청하기
            </Link>

            <a
              href="tel:010-2417-7936"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-white hover:text-coway-blue transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              전화 상담하기
            </a>
          </div>

          <p className="mt-8 text-blue-200">
            📞 010-2417-7936 | ⏰ 평일 09:00 - 18:00
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
