import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/posts');
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
    <div className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block bg-coway-blue/10 text-coway-blue px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            고객 후기
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-2">후기 게시판</h1>
          <p className="text-base md:text-lg text-gray-600 px-4">
            매트리스 케어 서비스를 이용하신 고객님들의 생생한 후기
          </p>
        </div>

        <div className="flex justify-end mb-4 md:mb-6">
          <Link
            to="/board/write"
            className="bg-gradient-to-r from-coway-blue to-blue-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all inline-flex items-center space-x-2 shadow-lg text-sm md:text-base whitespace-nowrap"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            <span>글쓰기</span>
          </Link>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden">
            {posts.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p className="text-gray-500 font-medium">등록된 게시글이 없습니다.</p>
                  <p className="text-sm text-gray-400">첫 후기를 작성해보세요!</p>
                </div>
              </div>
            ) : (
              posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/board/${post.id}`}
                  className="block border-b border-gray-100 p-4 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 flex-1 pr-2 line-clamp-2">
                      {post.title}
                      {post.comment_count > 0 && (
                        <span className="ml-2 bg-coway-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {post.comment_count}
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{post.author}</span>
                      {post.rating > 0 && (
                        <span className="flex items-center text-yellow-500">
                          {'⭐'.repeat(post.rating)}
                        </span>
                      )}
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{post.views}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">번호</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">제목</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">작성자</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">별점</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">작성일</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p className="text-gray-500 font-medium">등록된 게시글이 없습니다.</p>
                        <p className="text-sm text-gray-400">첫 후기를 작성해보세요!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post, index) => (
                    <tr key={post.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-5 text-sm font-medium text-gray-600">{posts.length - index}</td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/board/${post.id}`}
                          className="text-gray-900 hover:text-coway-blue font-semibold transition group inline-flex items-center"
                        >
                          <span className="group-hover:underline">{post.title}</span>
                          {post.comment_count > 0 && (
                            <span className="ml-2 bg-coway-blue text-white text-xs px-2 py-1 rounded-full font-bold">
                              {post.comment_count}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 font-medium">{post.author}</td>
                      <td className="px-6 py-5 text-sm text-center">
                        {post.rating > 0 ? (
                          <span className="text-yellow-500">{'⭐'.repeat(post.rating)}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">{formatDate(post.created_at)}</td>
                      <td className="px-6 py-5 text-sm text-gray-500 text-center font-medium">
                        <span className="inline-flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          <span>{post.views}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardPage;
