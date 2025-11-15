import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
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
      fetchData();
    }
  }, [filter, isAuthenticated]);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // 필터링된 데이터와 전체 데이터 모두 가져오기
      const [filteredRes, allRes] = await Promise.all([
        axios.get('/api/applications', {
          params: filter !== 'all' ? { status: filter } : {}
        }),
        filter !== 'all' ? axios.get('/api/applications') : Promise.resolve(null)
      ]);

      if (filteredRes.data.success) {
        setApplications(filteredRes.data.applications);

        // 전체 데이터로 통계 계산
        const allApps = allRes ? allRes.data.applications : filteredRes.data.applications;
        const calculatedStats = {
          totalApplications: allApps.length,
          pendingApplications: allApps.filter(a => a.status === 'pending').length,
          completedApplications: allApps.filter(a => a.status === 'completed').length,
          totalReviews: 0
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.patch(`/api/applications/${id}`, {
        status: newStatus
      });

      if (response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const deleteApplication = async (id, name) => {
    if (!confirm(`"${name}"님의 신청을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/applications/${id}`);

      if (response.data.success) {
        alert('신청이 삭제되었습니다.');
        fetchData();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: '확정', color: 'bg-blue-100 text-blue-800' },
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

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-500 text-sm mb-2">총 신청</div>
              <div className="text-3xl font-bold text-coway-blue">
                {stats.totalApplications}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-500 text-sm mb-2">대기중</div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pendingApplications}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-500 text-sm mb-2">완료</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.completedApplications}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-500 text-sm mb-2">후기</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalReviews}
              </div>
            </div>
          </div>
        )}

        {/* 필터 버튼 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex space-x-2">
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
              확정
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
        </div>

        {/* 신청 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden">
            {applications.map((app) => (
              <div key={app.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg text-gray-900">{app.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(app.created_at)}</div>
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

                <div className="mt-4 space-y-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="pending">대기중</option>
                    <option value="confirmed">확정</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소</option>
                  </select>

                  <div className="flex gap-2">
                    {app.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(app.id, 'completed')}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold"
                      >
                        ✓ 완료 처리
                      </button>
                    )}
                    <button
                      onClick={() => deleteApplication(app.id, app.name)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      삭제
                    </button>
                  </div>
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
                    신청일
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태 변경
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    케어 완료
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.name}
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
                        <option value="confirmed">확정</option>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
      </div>
    </div>
  );
}

export default AdminPage;
