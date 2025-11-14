import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author: '',
    content: ''
  });

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      if (response.data.success) {
        setPost(response.data.post);
      }
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      alert('게시글을 찾을 수 없습니다.');
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/api/posts/${id}/comments`,
        commentForm
      );

      if (response.data.success) {
        setCommentForm({ author: '', content: '' });
        fetchComments();
        alert('댓글이 등록되었습니다.');
      }
    } catch (error) {
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 게시글 */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden border border-gray-100">
          {/* 헤더 */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-8">
            <div className="inline-block bg-coway-blue/10 text-coway-blue px-3 py-1 rounded-full text-xs font-bold mb-4">
              고객 후기
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{post.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
              <span className="inline-flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">{post.author}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <span>{formatDate(post.created_at)}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span>{post.views}</span>
              </span>
            </div>
          </div>

          {/* 내용 */}
          <div className="px-8 py-10">
            <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>

        {/* 댓글 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <svg className="w-7 h-7 text-coway-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold">
              댓글 <span className="text-coway-blue">({comments.length})</span>
            </h2>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4 mb-10">
            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p className="text-gray-500 font-medium">아직 댓글이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">첫 댓글을 작성해보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-coway-blue bg-blue-50/30 pl-5 pr-4 py-4 rounded-r-lg hover:bg-blue-50/50 transition">
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-bold text-gray-900">{comment.author}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="border-t-2 border-gray-100 pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-coway-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span>댓글 작성</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-800 font-bold mb-2 text-sm">이름</label>
                <input
                  type="text"
                  name="author"
                  value={commentForm.author}
                  onChange={handleCommentChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-gray-800 font-bold mb-2 text-sm">댓글</label>
                <textarea
                  name="content"
                  value={commentForm.content}
                  onChange={handleCommentChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coway-blue focus:border-transparent transition shadow-sm hover:border-gray-300"
                  placeholder="댓글 내용을 입력하세요"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-coway-blue to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all inline-flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
                <span>댓글 등록</span>
              </button>
            </div>
          </form>
        </div>

        {/* 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/board')}
            className="bg-gray-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-700 hover:shadow-lg transition-all inline-flex items-center space-x-2 shadow"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            <span>목록으로</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;
