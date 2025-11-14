import { useState, useEffect } from 'react';
import axios from 'axios';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reviews');
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('후기 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await axios.post('/api/reviews', formData);

      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: '후기가 등록되었습니다!'
        });

        // 폼 초기화
        setFormData({
          name: '',
          rating: 5,
          content: ''
        });

        // 후기 목록 새로고침
        fetchReviews();

        // 폼 닫기
        setTimeout(() => {
          setShowForm(false);
          setSubmitStatus(null);
        }, 2000);
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: '후기 등록 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">고객 후기</h1>
          <p className="text-xl text-gray-600 mb-6">
            매트리스 케어 서비스를 이용하신 분들의 생생한 후기를 확인하세요
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-coway-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-coway-navy transition"
          >
            {showForm ? '후기 작성 취소' : '후기 작성하기'}
          </button>
        </div>

        {/* 후기 작성 폼 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">후기 작성</h2>

            {submitStatus && (
              <div className={`mb-6 p-4 rounded ${
                submitStatus.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coway-blue"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    평점 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coway-blue"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                    <option value="4">⭐⭐⭐⭐ (4점)</option>
                    <option value="3">⭐⭐⭐ (3점)</option>
                    <option value="2">⭐⭐ (2점)</option>
                    <option value="1">⭐ (1점)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  후기 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coway-blue"
                  placeholder="서비스를 이용하신 소감을 자유롭게 작성해주세요"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coway-blue text-white py-3 rounded-lg font-semibold text-lg hover:bg-coway-navy transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '등록 중...' : '후기 등록하기'}
              </button>
            </form>
          </div>
        )}

        {/* 후기 목록 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            전체 후기 <span className="text-coway-blue">({reviews.length})</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">아직 등록된 후기가 없습니다.</p>
              <p className="text-gray-400 mt-2">첫 번째 후기를 작성해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <span key={i} className="text-gray-300 text-xl">★</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-line">
                    {review.content}
                  </p>

                  <div className="border-t pt-4">
                    <p className="text-gray-600 font-semibold">- {review.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;
