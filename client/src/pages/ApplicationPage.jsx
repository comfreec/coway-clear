import { useState } from 'react';
import axios from 'axios';

function ApplicationPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    detail_address: '',
    mattress_type: '',
    mattress_age: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post('/api/applications', formData);

      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: '신청이 완료되었습니다! 곧 연락드리겠습니다.'
        });

        // 폼 초기화
        setFormData({
          name: '',
          phone: '',
          address: '',
          detail_address: '',
          mattress_type: '',
          mattress_age: '',
          message: ''
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: '신청 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-block bg-coway-blue/10 text-coway-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            무료 서비스
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            무료 매트리스 케어 신청
          </h1>
          <p className="text-lg text-gray-600">
            간단한 정보를 입력하시면 전문 상담사가 연락드립니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
          {/* 안내 메시지 */}
          <div className="bg-gradient-to-r from-coway-blue to-blue-600 text-white p-6 rounded-xl mb-8">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div>
                <h3 className="font-bold text-lg mb-1">신청 안내</h3>
                <p className="text-sm opacity-90">
                  전문 홈케어 닥터가 방문하여 무료로 매트리스 케어 서비스를 제공해드립니다.
                  신청 후 24시간 내에 연락드립니다.
                </p>
              </div>
            </div>
          </div>

          {submitStatus && (
            <div className={`mb-6 p-5 rounded-xl flex items-start space-x-3 ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                {submitStatus.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                )}
              </svg>
              <span className="font-medium">{submitStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300 mb-3"
                placeholder="서울시 강남구 테헤란로 123"
              />
              <input
                type="text"
                name="detail_address"
                value={formData.detail_address}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                placeholder="상세주소 (동/호수)"
              />
            </div>

            {/* 매트리스 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  매트리스 종류
                </label>
                <select
                  name="mattress_type"
                  value={formData.mattress_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300 bg-white"
                >
                  <option value="">선택하세요</option>
                  <option value="spring">스프링 매트리스</option>
                  <option value="memory">메모리폼 매트리스</option>
                  <option value="latex">라텍스 매트리스</option>
                  <option value="hybrid">하이브리드 매트리스</option>
                  <option value="coway">코웨이 매트리스</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  사용 기간
                </label>
                <select
                  name="mattress_age"
                  value={formData.mattress_age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300 bg-white"
                >
                  <option value="">선택하세요</option>
                  <option value="0-1">1년 미만</option>
                  <option value="1-3">1-3년</option>
                  <option value="3-5">3-5년</option>
                  <option value="5-10">5-10년</option>
                  <option value="10+">10년 이상</option>
                </select>
              </div>
            </div>

            {/* 추가 메시지 */}
            <div>
              <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                추가 요청사항
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                placeholder="특이사항이나 요청사항을 입력해주세요"
              ></textarea>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-coway-blue to-blue-600 text-white py-5 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>신청 중...</span>
                </span>
              ) : (
                '무료 케어 신청하기'
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <p>신청하신 내용은 무료 케어 서비스 제공 목적으로만 사용됩니다</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplicationPage;
