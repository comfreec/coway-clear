import { useState, useEffect } from 'react';
import axios from 'axios';

// Axios 인스턴스 생성 - Vercel 배포 환경에서도 작동하도록
const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : '',
  headers: {
    'Content-Type': 'application/json'
  }
});

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchDate, setSearchDate] = useState(''); // 날짜 검색
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'posts'
  const [viewArchived, setViewArchived] = useState(false); // 보관함 보기
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    window.scrollTo(0, 0);
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // 인증된 경우에만 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'applications') {
        fetchData();
      } else {
        fetchPosts();
      }
    }
  }, [filter, searchDate, isAuthenticated, activeTab, viewArchived]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '0070') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'authenticated');
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/archived-applications');

      if (response.data.success) {
        setApplications(response.data.applications);
        // 보관함은 통계 없음
        setStats(null);
      }
    } catch (error) {
      console.error('보관함 로딩 실패:', error);
      alert('보관함을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 보관함 보기 모드라면 보관된 데이터 가져오기
      if (viewArchived) {
        fetchArchivedData();
        return;
      }

      // 항상 전체 데이터 가져오기 (query parameter 문제 회피)
      const response = await api.get('/api/applications');

      if (response.data.success) {
        const allApps = response.data.applications;

        // 클라이언트 측에서 필터링 (상태 또는 날짜)
        let filteredApps = allApps;

        // 날짜 검색이 우선 (날짜가 선택되어 있으면 날짜로만 필터링)
        if (searchDate) {
          filteredApps = filteredApps.filter(app => {
            if (!app.preferred_date) return false;
            // 완료건은 제외
            if (app.status === 'completed') return false;
            // preferred_date가 YYYY-MM-DD 형식이라고 가정
            return app.preferred_date === searchDate;
          });
        }
        // 날짜 검색이 없을 때만 상태 필터링 적용
        else if (filter === 'confirmed') {
          // 컨택완료: 약속 날짜/시간이 있는 항목 (완료건 제외)
          filteredApps = filteredApps.filter(app => {
            return app.preferred_date && app.preferred_time && app.status !== 'completed';
          });
        }
        else if (filter === 'pending') {
          // 대기중: 대기중 상태이면서 약속이 안 잡힌 항목
          filteredApps = filteredApps.filter(app => {
            return app.status === 'pending' && (!app.preferred_date || !app.preferred_time);
          });
        }
        else if (filter !== 'all') {
          filteredApps = filteredApps.filter(app => app.status === filter);
        }

        // 정렬: 완료건은 뒤로, 나머지는 최신순
        filteredApps.sort((a, b) => {
          // 완료 상태는 뒤로
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;

          // 같은 상태 그룹 내에서는 최신순
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setApplications(filteredApps);

        // 전체 데이터로 통계 계산
        const calculatedStats = {
          totalApplications: allApps.length,
          pendingApplications: allApps.filter(a => a.status === 'pending' && (!a.preferred_date || !a.preferred_time)).length,
          confirmedApplications: allApps.filter(a => a.preferred_date && a.preferred_time && a.status !== 'completed').length,
          completedApplications: allApps.filter(a => a.status === 'completed').length,
          contactedApplications: allApps.filter(a => a.preferred_date && a.preferred_time).length,
          totalReviews: 0
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      console.error('에러 상세:', error.response?.data);

      // 상세한 에러 메시지 표시
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || '알 수 없는 오류';

      alert(`데이터를 불러오는 중 오류가 발생했습니다.\n\n에러: ${errorMessage}\n\n브라우저 개발자 도구(F12)의 Console 탭에서 자세한 정보를 확인하세요.`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // 취소를 선택하면 대기중으로 변경하고 약속 날짜/시간도 제거
      const updateData = {};

      if (newStatus === 'cancelled') {
        updateData.status = 'pending';
        updateData.preferred_date = '';
        updateData.preferred_time = '';
      } else {
        updateData.status = newStatus;
      }

      const response = await api.patch(`/api/applications/${id}`, updateData);

      if (response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const updateDateTime = async (id, preferred_date, preferred_time) => {
    try {
      const response = await api.patch(`/api/applications/${id}`, {
        preferred_date,
        preferred_time
      });

      if (response.data.success) {
        alert('약속 날짜/시간이 저장되었습니다.');
        fetchData();
      }
    } catch (error) {
      console.error('날짜/시간 업데이트 실패:', error);
      alert('날짜/시간 업데이트 중 오류가 발생했습니다.');
    }
  };

  const deleteApplication = async (id, name) => {
    if (!confirm(`"${name}"님의 신청을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      // 보관함 보기 중이면 archived_applications에서 삭제
      const endpoint = viewArchived
        ? `/api/archived-applications/${id}`
        : `/api/applications/${id}`;

      const response = await api.delete(endpoint);

      if (response.data.success) {
        alert('신청이 삭제되었습니다.');
        fetchData();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const archiveCompleted = async () => {
    if (!confirm('완료 처리된 모든 항목을 보관함으로 이동하시겠습니까?')) {
      return;
    }

    try {
      const response = await api.post('/api/applications/archive');

      if (response.data.success) {
        alert(response.data.message);
        fetchData();
      }
    } catch (error) {
      console.error('보관 실패:', error);
      alert('보관 중 오류가 발생했습니다.');
    }
  };

  const restoreApplication = async (id, name) => {
    if (!confirm(`"${name}"님의 신청을 일반 목록으로 복원하시겠습니까?`)) {
      return;
    }

    try {
      const response = await api.post(`/api/archived-applications/${id}/restore`);

      if (response.data.success) {
        alert('항목이 복원되었습니다.');
        fetchData();
      }
    } catch (error) {
      console.error('복원 실패:', error);
      alert('복원 중 오류가 발생했습니다.');
    }
  };

  // 후기 목록 조회
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/posts');

      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('후기 로딩 실패:', error);
      alert('후기를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 후기 삭제
  const deletePost = async (id, title) => {
    if (!confirm(`"${title}" 후기를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/posts/${id}`);

      if (response.data.success) {
        alert('후기가 삭제되었습니다.');
        fetchPosts();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: '컨택완료', color: 'bg-blue-100 text-blue-800' },
      completed: { text: '완료', color: 'bg-green-100 text-green-800' },
      cancelled: { text: '취소', color: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 로그인 페이지
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">관리자 로그인</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coway-blue"
                placeholder="비밀번호를 입력하세요"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-coway-blue text-white py-3 rounded-lg font-semibold hover:bg-coway-navy transition"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'applications'
                  ? 'bg-coway-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 신청 관리
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'posts'
                  ? 'bg-coway-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⭐ 후기 관리
            </button>
          </div>
        </div>

        {activeTab === 'applications' && (
          <>
        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="text-gray-500 text-xs md:text-sm mb-2">총 신청</div>
              <div className="text-2xl md:text-3xl font-bold text-coway-blue">
                {stats.totalApplications}
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="text-gray-500 text-xs md:text-sm mb-2">대기중</div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                {stats.pendingApplications}
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="text-gray-500 text-xs md:text-sm mb-2">컨택완료</div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {stats.confirmedApplications}
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="text-gray-500 text-xs md:text-sm mb-2">완료</div>
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {stats.completedApplications}
              </div>
            </div>
          </div>
        )}

        {/* 필터 버튼 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col gap-4">
            {/* 상태 필터 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${
                  filter === 'all'
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded ${
                  filter === 'pending'
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                대기중
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded ${
                  filter === 'confirmed'
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                컨택완료
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded ${
                  filter === 'completed'
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                완료
              </button>
            </div>

            {/* 날짜 검색 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                📅 컨택날짜:
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coway-blue"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 보관함 관리 */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              {!viewArchived && (
                <button
                  onClick={archiveCompleted}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  📦 완료처리보관
                </button>
              )}
              <button
                onClick={() => {
                  setViewArchived(!viewArchived);
                  setSearchDate('');
                  setFilter('all');
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewArchived
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {viewArchived ? '🔙 일반보기' : '📋 완료처리건보기'}
              </button>
              {viewArchived && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  보관함 보기 중
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 신청 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {viewArchived ? '📦 보관된 항목' : '📋 신청 내역'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {viewArchived
                ? `총 ${applications.length}개의 보관된 항목`
                : `총 ${applications.length}개의 신청`
              }
            </p>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`border-b border-gray-200 p-4 relative ${
                  app.status === 'completed'
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                {app.status === 'completed' && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(to top right, transparent 0%, transparent calc(50% - 2px), rgba(0, 0, 0, 0.3) calc(50% - 2px), rgba(0, 0, 0, 0.3) calc(50% + 2px), transparent calc(50% + 2px), transparent 100%)'
                  }}></div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-lg text-gray-900">{app.name}</div>
                      {app.preferred_date && app.preferred_time && !viewArchived && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ✓ 컨택완료
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {viewArchived && app.archived_at ? (
                        <span>📦 보관일: {formatDate(app.archived_at)}</span>
                      ) : (
                        <span>신청일: {formatDate(app.created_at)}</span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">연락처:</span> {app.phone}
                  </div>
                  <div>
                    <span className="font-semibold">주소:</span><br/>
                    {app.address}
                    {app.detail_address && ` ${app.detail_address}`}
                  </div>
                  <div>
                    <span className="font-semibold">매트리스:</span> {app.mattress_type || '-'} ({app.mattress_age || '-'})
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {/* 약속 날짜/시간 입력 (일반 보기만) */}
                  {!viewArchived && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <label className="block text-sm font-semibold text-blue-800 mb-2">📅 약속 날짜/시간 설정</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          id={`date-${app.id}`}
                          defaultValue={app.preferred_date || ''}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="time"
                          id={`time-${app.id}`}
                          defaultValue={app.preferred_time || ''}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const date = document.getElementById(`date-${app.id}`).value;
                            const time = document.getElementById(`time-${app.id}`).value;
                            updateDateTime(app.id, date, time);
                          }}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                        >
                          💾 약속 저장
                        </button>
                      </div>
                      {(app.preferred_date || app.preferred_time) && (
                        <div className="mt-2 pt-2 border-t border-blue-300">
                          <span className="text-xs font-semibold text-blue-800">현재 약속:</span>
                          <div className="text-sm text-blue-700 font-medium">
                            {app.preferred_date || '-'} {app.preferred_time || ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 보관함 보기 시 약속 정보만 표시 */}
                  {viewArchived && (app.preferred_date || app.preferred_time) && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">📅 컨택 일시</label>
                      <div className="text-sm text-gray-800">
                        {app.preferred_date || '-'} {app.preferred_time || ''}
                      </div>
                    </div>
                  )}

                  {!viewArchived && (
                    <>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">상태 변경</label>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="w-full border-2 border-coway-blue rounded-lg px-4 py-3 text-base font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-coway-blue"
                      >
                        <option value="pending">대기중</option>
                        <option value="confirmed">컨택완료</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소</option>
                      </select>

                      <div className="flex gap-2">
                        {app.status !== 'completed' && (
                          <button
                            onClick={() => updateStatus(app.id, 'completed')}
                            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-green-600 transition"
                          >
                            ✓ 완료 처리
                          </button>
                        )}
                        <button
                          onClick={() => deleteApplication(app.id, app.name)}
                          className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-red-600 transition"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </>
                  )}

                  {viewArchived && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreApplication(app.id, app.name)}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-blue-700 transition"
                      >
                        ↩️ 복원
                      </button>
                      <button
                        onClick={() => deleteApplication(app.id, app.name)}
                        className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-red-600 transition"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {viewArchived ? '보관일' : '신청일'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매트리스 정보
                  </th>
                  {!viewArchived && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        컨택일시
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태 변경
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        케어 완료
                      </th>
                    </>
                  )}
                  {viewArchived && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        컨택일시
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className={`relative ${
                      app.status === 'completed'
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {app.status === 'completed' && !viewArchived && (
                      <td className="absolute inset-0 pointer-events-none" colSpan="100" style={{
                        background: 'linear-gradient(to top right, transparent 0%, transparent calc(50% - 2px), rgba(0, 0, 0, 0.3) calc(50% - 2px), rgba(0, 0, 0, 0.3) calc(50% + 2px), transparent calc(50% + 2px), transparent 100%)'
                      }}></td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {viewArchived && app.archived_at ? formatDate(app.archived_at) : formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{app.name}</span>
                        {app.preferred_date && app.preferred_time && !viewArchived && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            ✓ 컨택완료
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {app.address}
                      {app.detail_address && ` ${app.detail_address}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{app.mattress_type || '-'}</div>
                      <div className="text-xs text-gray-400">{app.mattress_age || '-'}</div>
                    </td>
                    {!viewArchived && (
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="space-y-2 min-w-[200px]">
                          <input
                            type="date"
                            id={`desk-date-${app.id}`}
                            defaultValue={app.preferred_date || ''}
                            className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="time"
                            id={`desk-time-${app.id}`}
                            defaultValue={app.preferred_time || ''}
                            className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => {
                              const date = document.getElementById(`desk-date-${app.id}`).value;
                              const time = document.getElementById(`desk-time-${app.id}`).value;
                              updateDateTime(app.id, date, time);
                            }}
                            className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            💾 저장
                          </button>
                          {(app.preferred_date || app.preferred_time) && (
                            <div className="mt-1 pt-1 border-t border-blue-200">
                              <span className="text-xs text-blue-600">현재:</span>
                              <div className="text-xs text-blue-800 font-medium">
                                {app.preferred_date || '-'} {app.preferred_time || ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {viewArchived && (
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="text-xs">
                          {app.preferred_date && app.preferred_time ? (
                            <>
                              <div>{app.preferred_date}</div>
                              <div>{app.preferred_time}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    )}
                    {!viewArchived && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coway-blue"
                          >
                            <option value="pending">대기중</option>
                            <option value="confirmed">컨택완료</option>
                            <option value="completed">완료</option>
                            <option value="cancelled">취소</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {app.status !== 'completed' ? (
                            <button
                              onClick={() => updateStatus(app.id, 'completed')}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition font-semibold"
                            >
                              ✓ 완료 처리
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">✓ 완료됨</span>
                          )}
                        </td>
                      </>
                    )}
                    {viewArchived && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        {viewArchived && (
                          <button
                            onClick={() => restoreApplication(app.id, app.name)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold inline-flex items-center space-x-1"
                            title="복원"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                            </svg>
                            <span>복원</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteApplication(app.id, app.name)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold inline-flex items-center space-x-1"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          <span>삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                신청 내역이 없습니다
              </div>
            )}
          </div>

          {/* 모바일 빈 목록 */}
          {applications.length === 0 && (
            <div className="block md:hidden text-center py-12 text-gray-500">
              신청 내역이 없습니다
            </div>
          )}
        </div>
          </>
        )}

        {/* 후기 관리 탭 */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">후기 게시판 관리</h2>
              <p className="text-sm text-gray-600 mt-1">총 {posts.length}개의 후기</p>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="block md:hidden">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  등록된 후기가 없습니다
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{post.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{post.author}</span>
                        {post.rating > 0 && (
                          <span className="text-yellow-500">{'⭐'.repeat(post.rating)}</span>
                        )}
                        <span>조회 {post.views}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">작성자</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">별점</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">조회</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">삭제</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        등록된 후기가 없습니다
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {post.title}
                          {post.comment_count > 0 && (
                            <span className="ml-2 bg-coway-blue text-white text-xs px-2 py-0.5 rounded-full">
                              {post.comment_count}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{post.author}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          {post.rating > 0 ? (
                            <span className="text-yellow-500">{'⭐'.repeat(post.rating)}</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{post.views}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deletePost(post.id, post.title)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold inline-flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <span>삭제</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
