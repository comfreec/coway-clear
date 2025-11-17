function MitesPage() {
  const miteImages = [
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
  ];

  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-red-50 via-white to-orange-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block bg-red-100 text-red-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            건강 경고
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
            진드기 실태
          </h1>
          <p className="text-base md:text-lg text-gray-600 px-4 max-w-3xl mx-auto leading-relaxed">
            당신의 매트리스에는 지금 이 순간에도 수백만 마리의 진드기가 살고 있습니다.<br/>
            육안으로는 보이지 않지만, 건강에 심각한 영향을 미칩니다.
          </p>
        </div>

        {/* 경고 박스 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 md:p-8 mb-12 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                진드기로 인한 건강 위협
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">•</span>
                  <span><strong>알레르기 비염:</strong> 재채기, 콧물, 코막힘 증상</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">•</span>
                  <span><strong>아토피 피부염:</strong> 가려움증, 피부 염증 악화</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">•</span>
                  <span><strong>천식 유발:</strong> 호흡곤란, 기침 증상 악화</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">•</span>
                  <span><strong>수면 장애:</strong> 알레르기 반응으로 인한 수면 질 저하</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 진드기 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">200만 마리</div>
              <p className="text-gray-600 font-medium">일반 매트리스의 평균 진드기 개체수</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">0.3mm</div>
              <p className="text-gray-600 font-medium">집먼지진드기의 평균 크기 (육안 불가)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">3개월</div>
              <p className="text-gray-600 font-medium">진드기 개체수가 2배로 증가하는 기간</p>
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            진드기 사진
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {miteImages.map((imageUrl, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 shadow-lg hover:shadow-2xl transition">
                  <img
                    src={imageUrl}
                    alt={`진드기 관련 사진 ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-coway-blue to-blue-600 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            지금 바로 무료 매트리스 케어 신청하세요
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            전문 장비로 진드기를 99.9% 제거하고<br className="hidden md:block"/>
            건강한 수면 환경을 되찾으세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/application"
              className="bg-white text-coway-blue px-8 md:px-12 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-2 shadow-lg"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
              </svg>
              <span>무료 케어 신청하기</span>
            </a>
            <a
              href="/board"
              className="bg-blue-700 text-white px-8 md:px-12 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span>고객 후기 보기</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MitesPage;
