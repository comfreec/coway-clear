import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BoardWritePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    password: ''
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/posts', {
        ...formData,
        rating
      });

      if (response.data.success) {
        alert('게시글이 등록되었습니다.');
        navigate(`/board/${response.data.postId}`);
      }
    } catch (error) {
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-block bg-coway-blue/10 text-coway-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            후기 작성
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">글쓰기</h1>
          <p className="text-lg text-gray-600">
            매트리스 케어 서비스 이용 후기를 남겨주세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
          {/* 안내 메시지 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-xl mb-8">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-coway-blue mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-gray-700">
                작성하신 후기는 다른 고객님들에게 큰 도움이 됩니다. 비밀번호는 게시글 수정/삭제 시 필요하니 기억해주세요.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  작성자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            {/* 별점 선택 */}
            <div>
              <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                별점 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12"
                      fill={(hoverRating || rating) >= star ? '#FCD34D' : '#E5E7EB'}
                      stroke="#FCD34D"
                      strokeWidth="1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-lg font-bold text-gray-700">
                    {rating}점
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="15"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                placeholder="서비스 이용 후기를 자유롭게 작성해주세요"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-coway-blue to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>등록 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>등록하기</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/board')}
                className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-600 hover:shadow-lg transition-all shadow"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BoardWritePage;
