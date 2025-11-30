import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 이미지 import
import dirtyImage1 from '../assets/images/1.jpg';
import dirtyImage2 from '../assets/images/2.jpg';
import dirtyImage3 from '../assets/images/3.jpg';

function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [customPrefix, setCustomPrefix] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [showDirtyPhotos, setShowDirtyPhotos] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(true);
  const [showYouTubeVideo, setShowYouTubeVideo] = useState(false);

  const dirtyImages = [dirtyImage1, dirtyImage2, dirtyImage3];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % dirtyImages.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + dirtyImages.length) % dirtyImages.length);
  };

  // 터치/스와이프 지원
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextPhoto();
    } else if (isRightSwipe) {
      prevPhoto();
    }
  };

  // Social Proof 가짜 데이터 (20명)
  const socialProofData = [
    { name: '김민수', location: '서울 강남구', time: '방금 전' },
    { name: '이지은', location: '부산 해운대구', time: '1분 전' },
    { name: '박철수', location: '대구 수성구', time: '2분 전' },
    { name: '최영희', location: '인천 남동구', time: '3분 전' },
    { name: '정현우', location: '광주 서구', time: '5분 전' },
    { name: '강수진', location: '대전 유성구', time: '7분 전' },
    { name: '윤서연', location: '울산 남구', time: '10분 전' },
    { name: '장동혁', location: '경기 성남시', time: '12분 전' },
    { name: '한미영', location: '경기 용인시', time: '15분 전' },
    { name: '오준호', location: '서울 송파구', time: '18분 전' },
    { name: '신예린', location: '서울 마포구', time: '20분 전' },
    { name: '임태훈', location: '경기 고양시', time: '25분 전' },
    { name: '문지현', location: '인천 연수구', time: '30분 전' },
    { name: '배성민', location: '부산 동래구', time: '35분 전' },
    { name: '조은서', location: '대구 달서구', time: '40분 전' },
    { name: '류현진', location: '경기 수원시', time: '45분 전' },
    { name: '권나연', location: '서울 강서구', time: '50분 전' },
    { name: '송지훈', location: '광주 북구', time: '55분 전' },
    { name: '황민지', location: '대전 서구', time: '1시간 전' },
    { name: '안재원', location: '울산 중구', time: '1시간 전' }
  ];

  // 페이지 로드 시 스크롤을 맨 위로 + 설정 불러오기
  useEffect(() => {
    window.scrollTo(0, 0);

    // 설정 불러오기
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data.success && response.data.settings.customPrefix) {
          setCustomPrefix(response.data.settings.customPrefix);
        }
      } catch (error) {
        console.error('설정 로딩 실패:', error);
      }
    };
    fetchSettings();
  }, []);

  // Social Proof 알림 순환
  useEffect(() => {
    // 3초 후 첫 알림 시작
    const startTimer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    // 알림 순환 인터벌
    const interval = setInterval(() => {
      setShowNotification(false);

      setTimeout(() => {
        setCurrentNotificationIndex(prev =>
          (prev + 1) % socialProofData.length
        );
        setShowNotification(true);
      }, 1000); // 1초 후 다음 알림
    }, 8000); // 8초마다 변경

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, []);

  // 사진 모달 관리 및 뒤로가기 처리
  useEffect(() => {
    const handlePopState = (e) => {
      setShowDirtyPhotos(false);
      setCurrentPhotoIndex(0);
      setIsZoomed(true);
      navigate('/application');
    };

    if (showDirtyPhotos) {
      // 모달이 열릴 때 history에 state 추가
      window.history.pushState({ modal: 'photos' }, '');
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showDirtyPhotos, navigate]);

  // 모달 닫기 함수
  const closeModal = () => {
    setShowDirtyPhotos(false);
    setCurrentPhotoIndex(0);
    setIsZoomed(true);
    // history.back()으로 pushState 제거
    if (window.history.state?.modal === 'photos') {
      window.history.back();
    }
  };

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
          {/* 긴급성 배지 */}
          <div className="mb-4 md:mb-6 animate-bounce">
            <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-bold shadow-2xl">
              🔥 선착순 무료 케어 진행중
            </div>
          </div>

          {customPrefix && (
            <div className="mb-6 md:mb-8 px-2">
              <span
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold shimmer-text"
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #ffffff 40%, #ffd700 50%, #ffffff 60%, #ffffff 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 6s ease-in-out infinite',
                  textShadow: 'none'
                }}
              >
                {customPrefix}
              </span>
            </div>
          )}

          {/* 반짝이는 shimmer 애니메이션 CSS */}
          <style>{`
            @keyframes shimmer {
              0% {
                background-position: 200% center;
              }
              100% {
                background-position: -200% center;
              }
            }

            @keyframes pulseCard {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
              }
              50% {
                transform: scale(1.02);
                box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
              }
            }
          `}</style>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 px-2" style={{ lineHeight: '1.5' }}>
            <span className="text-yellow-300 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">5만원 상당</span><br />
            매트리스 케어를<br />
            <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">지금 100% 무료</span>로!
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 text-yellow-300 font-bold max-w-3xl mx-auto px-4 animate-pulse">
            ⚠️ 당신의 매트리스에 진드기가 수백만 마리!
          </p>

          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
            전문가의 무료 진단부터 99.9% 진드기 제거까지<br />
            <span className="text-yellow-200 font-semibold">지금 신청하지 않으면 기회를 놓칩니다!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8 px-4">
            <Link
              to="/application"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-gray-900 px-6 sm:px-8 md:px-12 py-4 md:py-5 rounded-full text-base md:text-xl font-black hover:scale-110 transition-all transform shadow-2xl whitespace-nowrap animate-pulse border-4 border-yellow-500"
            >
              <span>👉 지금 바로 무료 신청 (5만원 혜택!)</span>
              <svg className="ml-2 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/mites"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 sm:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:scale-105 transition-all shadow-xl whitespace-nowrap border-2 border-red-400"
            >
              ⚠️ 진드기 사진 보기 (충격주의)
            </Link>

            <Link
              to="/board"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-semibold hover:bg-white hover:text-coway-blue transition-all whitespace-nowrap"
            >
              ⭐ 고객 후기 보기 (만족도 4.9/5)
            </Link>

            <button
              onClick={() => setShowYouTubeVideo(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:scale-105 transition-all shadow-xl whitespace-nowrap border-2 border-purple-400"
            >
              📹 진드기 위험성 영상 보기
            </button>
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

      {/* 고객 후기 미리보기 Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">💯 실제 고객님들의 생생한 후기</h2>
            <p className="text-gray-600">이미 <span className="text-coway-blue font-bold">10,000명 이상</span>이 경험했습니다!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {[
              { name: "김민수", rating: 5, text: "매트리스 케어 받고 나서 천식 증상이 많이 좋아졌어요. 진드기가 정말 많이 나왔다고 하더라고요. 무료로 해주셔서 감사합니다!", badge: "천식 개선" },
              { name: "이지은", rating: 5, text: "아이가 알레르기가 있어서 걱정했는데, 케어 후 훨씬 좋아졌어요. 전문가분이 친절하게 설명도 해주시고 매트리스 상태 리포트도 주셨어요.", badge: "알레르기 완화" },
              { name: "박철수", rating: 5, text: "10년 된 매트리스라 걱정했는데, 케어 받고 나니 새것처럼 깨끗해졌어요. 코웨이 제품으로 교체도 고민중입니다.", badge: "새 것처럼" }
            ].map((review, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-coway-blue rounded-full flex items-center justify-center text-white font-bold">
                      {review.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{review.name}</div>
                      <div className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</div>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {review.badge}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 md:mt-8">
            <Link to="/board" className="inline-flex items-center text-coway-blue font-bold hover:underline">
              후기 더 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Before/After Section - 새로 추가 */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              😱 충격! 케어 전 vs 후 비교
            </h2>
            <p className="text-gray-300 text-base md:text-lg">
              당신의 매트리스도 이럴 수 있습니다
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Before */}
              <div
                onClick={() => setShowDirtyPhotos(true)}
                className="relative bg-red-900/30 border-4 border-red-500 rounded-2xl p-6 md:p-8 cursor-pointer hover:scale-105 transition-transform"
                style={{ animation: 'pulseCard 2s ease-in-out infinite' }}
              >
                {/* 클릭 유도 배지 */}
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-red-900 px-3 py-1.5 rounded-full text-xs md:text-sm font-black shadow-lg border-2 border-yellow-300 animate-bounce">
                  👆 클릭하여 사진 보기
                </div>

                <div className="bg-red-500 text-white text-center py-2 rounded-lg mb-4 font-bold text-lg">
                  ❌ 케어 전
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-red-200">
                    <span className="text-2xl">🦠</span>
                    <div>
                      <div className="font-bold">진드기 200만 마리 이상</div>
                      <div className="text-sm text-gray-300">알레르기, 천식 유발</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-red-200">
                    <span className="text-2xl">😷</span>
                    <div>
                      <div className="font-bold">곰팡이 포자 번식</div>
                      <div className="text-sm text-gray-300">호흡기 질환 위험</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-red-200">
                    <span className="text-2xl">🤢</span>
                    <div>
                      <div className="font-bold">악취 및 오염물질</div>
                      <div className="text-sm text-gray-300">수면 방해, 건강 악화</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="bg-green-900/30 border-4 border-green-500 rounded-2xl p-6 md:p-8">
                <div className="bg-green-500 text-white text-center py-2 rounded-lg mb-4 font-bold text-lg">
                  ✅ 케어 후
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-green-200">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="font-bold">진드기 99.9% 제거</div>
                      <div className="text-sm text-gray-300">전문 UV 살균 + 고온 스팀</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-green-200">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <div className="font-bold">완벽한 위생 상태</div>
                      <div className="text-sm text-gray-300">새 매트리스처럼 깨끗</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-green-200">
                    <span className="text-2xl">😴</span>
                    <div>
                      <div className="font-bold">건강한 수면 환경</div>
                      <div className="text-sm text-gray-300">가족 건강 지키기</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 text-center">
              <Link
                to="/application"
                className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-black hover:scale-110 transition-all transform shadow-2xl whitespace-nowrap border-4 border-yellow-500"
              >
                🎁 지금 무료로 깨끗하게 만들기 (5만원 상당)
              </Link>
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
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
              케어 서비스 프로세스
            </h2>
            <p className="text-base md:text-xl text-gray-600 px-4">
              간편한 4단계로 건강한 수면 환경을 만들어드립니다
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* 연결선 */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-coway-blue to-coway-green transform -translate-y-1/2"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
                {[
                  { num: 1, icon: "📝", title: "신청", desc: "간편한 온라인 신청으로 시작하세요" },
                  { num: 2, icon: "📞", title: "방문 예약", desc: "편하신 시간에 전문가가 방문합니다" },
                  { num: 3, icon: "🔬", title: "진단 & 케어", desc: "매트리스 상태 진단 후 전문 케어 진행" },
                  { num: 4, icon: "📊", title: "리포트 제공", desc: "케어 전후 상태를 리포트로 제공" }
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="relative inline-block mb-3 md:mb-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-coway-blue to-coway-green text-white rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold shadow-xl transform hover:scale-110 transition-transform">
                        {step.num}
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 px-2">{step.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">신뢰할 수 있는 전문서비스</h2>
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
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
              자주 묻는 질문
            </h2>
            <p className="text-base md:text-xl text-gray-600 px-4">
              궁금하신 사항을 확인해보세요
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-sm md:text-lg pr-4 md:pr-8">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 md:w-6 md:h-6 text-coway-blue transition-transform flex-shrink-0 ${
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
                  <div className="px-4 md:px-6 pb-4 md:pb-5 text-sm md:text-base text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 긴급 마감 임박 디자인 */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-red-600 via-orange-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-300 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* 긴급 마감 배지 */}
          <div className="mb-4 md:mb-6">
            <div className="inline-block bg-yellow-400 text-red-900 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-black shadow-2xl animate-bounce">
              ⚠️ 마감 임박! 이번 달 무료 케어 선착순 마감
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 px-2 leading-tight">
            지금 신청 안 하시면<br />
            <span className="text-yellow-300 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">5만원을 내야 합니다!</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 max-w-4xl mx-auto px-4">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-yellow-400 rounded-xl p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-black text-yellow-300 mb-2">10,000+</div>
              <div className="text-sm md:text-base">만족한 고객님</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-yellow-400 rounded-xl p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-black text-yellow-300 mb-2">99.9%</div>
              <div className="text-sm md:text-base">진드기 제거율</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-yellow-400 rounded-xl p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-black text-yellow-300 mb-2">100%</div>
              <div className="text-sm md:text-base">완전 무료</div>
            </div>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 text-yellow-100 max-w-2xl mx-auto px-4 font-bold">
            💰 정상가 5만원 ➜ <span className="text-yellow-300 text-2xl md:text-3xl">지금은 0원!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link
              to="/application"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-gray-900 px-8 md:px-12 py-5 md:py-6 rounded-full text-lg md:text-2xl font-black hover:scale-110 transition-all transform shadow-2xl whitespace-nowrap animate-pulse border-4 border-yellow-500"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              30초 만에 무료 신청 완료!
            </Link>

            <a
              href="tel:010-2417-7936"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-red-600 px-8 md:px-12 py-5 md:py-6 rounded-full text-base md:text-xl font-black hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-2xl whitespace-nowrap"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              긴급 전화 상담
            </a>
          </div>

          <p className="mt-6 md:mt-8 text-sm md:text-base text-yellow-200 px-4 font-bold">
            📞 010-2417-7936 | ⏰ 연중무휴 09:00 - 21:00
          </p>

          <p className="mt-4 text-xs md:text-sm text-yellow-300 px-4 animate-pulse">
            ⚠️ 주의: 선착순 마감 시 정상가 5만원으로 유료 전환됩니다
          </p>
        </div>
      </section>

      {/* Social Proof 알림 */}
      <div
        className={`fixed bottom-4 left-4 z-50 transition-all duration-700 ${
          showNotification
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-full'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-2xl border-l-4 border-yellow-400 p-4 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-800 text-lg font-bold">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {socialProofData[currentNotificationIndex]?.name?.charAt(0)}**님이 신청했습니다
              </p>
              <p className="text-xs text-yellow-300 font-semibold">
                {socialProofData[currentNotificationIndex]?.time}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 오염된 매트리스 사진 모달 */}
      {showDirtyPhotos && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-3 md:p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              className="absolute -top-10 md:-top-12 right-0 text-white text-3xl md:text-4xl font-bold hover:text-red-500 transition z-10"
            >
              ✕
            </button>

            {/* 제목 */}
            <h2 className="text-white text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 px-2">
              ⚠️ 충격 주의! 실제 오염된 매트리스
            </h2>

            {/* 이미지 슬라이더 */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {/* 이전/다음 버튼 - 항상 표시 */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition z-10"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextPhoto}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition z-10"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 이미지 - 터치/스와이프 지원 */}
              <img
                src={dirtyImages[currentPhotoIndex]}
                alt={`오염된 매트리스 ${currentPhotoIndex + 1}`}
                className={`w-full cursor-pointer transition-all ${
                  isZoomed ? 'h-[70vh] md:h-[80vh]' : 'h-64 md:h-96'
                } object-contain`}
                onClick={() => setIsZoomed(!isZoomed)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              />


              {/* 페이지 인디케이터 - 항상 표시 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {dirtyImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition ${
                      idx === currentPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 사진 번호 */}
            <div className="text-white text-center mt-3 text-sm md:text-base">
              {currentPhotoIndex + 1} / {dirtyImages.length}
            </div>

            {/* 경고 메시지 */}
            <div className="mt-4 md:mt-6 bg-red-600 text-white p-3 md:p-4 rounded-lg text-center">
              <p className="font-bold text-base md:text-lg mb-1 md:mb-2">당신의 매트리스도 이럴 수 있습니다!</p>
              <p className="text-xs md:text-sm">지금 바로 무료 케어를 신청하세요</p>
            </div>

            {/* 신청 버튼 */}
            <div className="mt-3 md:mt-4 text-center px-2">
              <Link
                to="/application"
                onClick={closeModal}
                className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-xl font-black hover:scale-105 transition-transform shadow-2xl w-full md:w-auto"
              >
                🎁 지금 무료로 케어 신청하기
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* YouTube 영상 모달 */}
      {showYouTubeVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-2 md:p-4"
          onClick={() => setShowYouTubeVideo(false)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-screen flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowYouTubeVideo(false)}
              className="absolute -top-2 md:-top-12 right-0 text-white text-3xl md:text-4xl font-bold hover:text-red-500 transition z-10"
            >
              ✕
            </button>

            {/* 제목 */}
            <h2 className="text-white text-lg md:text-3xl font-bold text-center mb-3 md:mb-4 px-2 pt-8 md:pt-0">
              📹 진드기 위험성 영상
            </h2>

            {/* YouTube iframe - 거의 전체 화면 */}
            <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/terNhLRFTwI?autoplay=1&rel=0"
                title="진드기 위험성 영상"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof 애니메이션 CSS */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
