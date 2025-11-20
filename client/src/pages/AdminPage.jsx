import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'posts'
  const [viewArchived, setViewArchived] = useState(false); // 보관함 보기
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]); // 접속 중인 관리자
  const [showStats, setShowStats] = useState(false); // 통계 모달
  const [allApplicationsData, setAllApplicationsData] = useState([]); // 전체 데이터 (통계용)
  const [searchQuery, setSearchQuery] = useState(''); // 검색어
  const [searchInput, setSearchInput] = useState(''); // 검색 입력값 (디바운스용)
  const [sortBy, setSortBy] = useState('date'); // 정렬 기준
  const [showCalendar, setShowCalendar] = useState(false); // 캘린더 모달
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // 선택된 월
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const [customPrefix, setCustomPrefix] = useState(''); // 홈페이지 커스텀 문구
  const [customPrefixInput, setCustomPrefixInput] = useState(''); // 입력값
  const sessionIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const prevCountRef = useRef(0); // 이전 신청 수 (알림음용)
  const audioRef = useRef(null); // 알림음

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    window.scrollTo(0, 0);

    // URL 파라미터로 자동 로그인 확인
    const urlParams = new URLSearchParams(window.location.search);
    const autoKey = urlParams.get('key');

    // 특별한 키로 자동 로그인 (북마크용)
    if (autoKey === 'coway2024') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'authenticated');
      // URL에서 key 파라미터 제거 (보안)
      window.history.replaceState({}, '', '/admin');
      return;
    }

    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // 실시간 데이터 동기화 (Firebase 설정 시) 또는 API 폴링
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'applications' || viewArchived) {
      return;
    }

    // Firebase 실시간 동기화 사용 가능한 경우
    if (isFirebaseConfigured && db) {
      setLoading(true);

      try {
        // applications 컬렉션 실시간 리스너
        const applicationsQuery = query(
          collection(db, 'applications'),
          orderBy('created_at', 'desc')
        );

        const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
          try {
            const allApps = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              created_at: doc.data().created_at?.toDate().toISOString()
            }));

            processAndSetApplications(allApps);
            setLoading(false);
          } catch (error) {
            console.error('데이터 처리 실패:', error);
            setLoading(false);
          }
        }, (error) => {
          console.error('실시간 리스너 오류:', error);
          // 실시간 동기화 실패 시 API로 폴백
          fetchData();
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Firebase 리스너 설정 실패:', error);
        fetchData();
      }
    } else {
      // Firebase 미설정 시 API 사용
      fetchData();
    }
  }, [isAuthenticated, activeTab, viewArchived, filter, searchQuery, sortBy]);

  // 검색 실행
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // 검색 초기화
  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  // 설정 불러오기
  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      if (response.data.success) {
        const prefix = response.data.settings.customPrefix || '';
        setCustomPrefix(prefix);
        setCustomPrefixInput(prefix);
      }
    } catch (error) {
      console.error('설정 로딩 실패:', error);
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      const response = await api.patch('/api/settings', {
        customPrefix: customPrefixInput
      });
      if (response.data.success) {
        setCustomPrefix(customPrefixInput);
        alert('설정이 저장되었습니다.');
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  // 설정 초기화
  const resetSettings = async () => {
    if (!confirm('홈페이지 문구를 기본값으로 초기화하시겠습니까?')) {
      return;
    }
    setCustomPrefixInput('');
    try {
      const response = await api.patch('/api/settings', {
        customPrefix: ''
      });
      if (response.data.success) {
        setCustomPrefix('');
        alert('설정이 초기화되었습니다.');
      }
    } catch (error) {
      console.error('설정 초기화 실패:', error);
      alert('설정 초기화 중 오류가 발생했습니다.');
    }
  };

  // 설정 탭 진입 시 설정 불러오기
  useEffect(() => {
    if (isAuthenticated && activeTab === 'settings') {
      fetchSettings();
    }
  }, [isAuthenticated, activeTab]);

  // 데이터 처리 공통 함수
  const processAndSetApplications = (allApps) => {
    // 알림음: 새 신청이 들어왔는지 확인
    if (prevCountRef.current > 0 && allApps.length > prevCountRef.current) {
      playNotificationSound();
    }
    prevCountRef.current = allApps.length;

    // 전체 데이터 저장 (통계용)
    setAllApplicationsData(allApps);

    // 클라이언트 측에서 필터링
    let filteredApps = allApps;

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredApps = filteredApps.filter(app =>
        app.name?.toLowerCase().includes(query) ||
        app.phone?.includes(query) ||
        app.address?.toLowerCase().includes(query)
      );
    }

    // 상태 필터링
    if (filter === 'confirmed') {
      filteredApps = filteredApps.filter(app => {
        return app.preferred_date && app.preferred_time && app.status !== 'completed';
      });
    }
    else if (filter === 'pending') {
      filteredApps = filteredApps.filter(app => {
        return app.status === 'pending' && (!app.preferred_date || !app.preferred_time);
      });
    }
    else if (filter !== 'all') {
      filteredApps = filteredApps.filter(app => app.status === filter);
    }

    // 정렬
    filteredApps.sort((a, b) => {
      // 완료건은 항상 뒤로
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // 선택한 정렬 기준 적용
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '', 'ko');
        case 'area':
          return (a.address || '').localeCompare(b.address || '', 'ko');
        case 'date':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setApplications(filteredApps);

    // 통계 계산
    const calculatedStats = {
      totalApplications: allApps.length,
      pendingApplications: allApps.filter(a => a.status === 'pending' && (!a.preferred_date || !a.preferred_time)).length,
      confirmedApplications: allApps.filter(a => a.preferred_date && a.preferred_time && a.status !== 'completed').length,
      completedApplications: allApps.filter(a => a.status === 'completed').length,
      contactedApplications: allApps.filter(a => a.preferred_date && a.preferred_time).length,
      totalReviews: 0
    };
    setStats(calculatedStats);
  };

  // 보관함 또는 후기 탭 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    if (viewArchived && activeTab === 'applications') {
      fetchArchivedData();
    } else if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [isAuthenticated, activeTab, viewArchived]);

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
    // 세션 정리
    if (sessionIdRef.current) {
      deleteDoc(doc(db, 'admin_sessions', sessionIdRef.current)).catch(err =>
        console.error('세션 삭제 실패:', err)
      );
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  // 브라우저 정보 가져오기
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    return `${browser} ${isMobile ? '📱' : '💻'}`;
  };

  // 관리자 세션 생성
  const createAdminSession = async () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = sessionId;

    try {
      await setDoc(doc(db, 'admin_sessions', sessionId), {
        browser: getBrowserInfo(),
        loginTime: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      // 30초마다 heartbeat 업데이트
      heartbeatIntervalRef.current = setInterval(async () => {
        if (sessionIdRef.current) {
          try {
            await setDoc(doc(db, 'admin_sessions', sessionIdRef.current), {
              lastActive: serverTimestamp()
            }, { merge: true });
          } catch (err) {
            console.error('Heartbeat 실패:', err);
          }
        }
      }, 30000);
    } catch (err) {
      console.error('세션 생성 실패:', err);
    }
  };

  // 접속 중인 관리자 실시간 감시 (Firebase 설정 시에만)
  useEffect(() => {
    if (!isAuthenticated || !isFirebaseConfigured || !db) return;

    // 세션 생성
    createAdminSession();

    // 접속자 실시간 리스너
    try {
      const sessionsQuery = query(collection(db, 'admin_sessions'));
      const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loginTime: doc.data().loginTime?.toDate(),
          lastActive: doc.data().lastActive?.toDate()
        }));
        setActiveSessions(sessions);
      });

      // 페이지 닫을 때 세션 삭제
      const handleBeforeUnload = () => {
        if (sessionIdRef.current) {
          // Beacon API로 비동기 전송
          navigator.sendBeacon(`/api/delete-session/${sessionIdRef.current}`);
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        unsubscribeSessions();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (sessionIdRef.current) {
          deleteDoc(doc(db, 'admin_sessions', sessionIdRef.current)).catch(err =>
            console.error('세션 삭제 실패:', err)
          );
        }
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    } catch (error) {
      console.error('세션 관리 설정 실패:', error);
    }
  }, [isAuthenticated]);

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
        processAndSetApplications(allApps);
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

  // 메모 저장
  const updateMemo = async (id, memo) => {
    try {
      const response = await api.patch(`/api/applications/${id}`, { memo });
      if (response.data.success) {
        // 조용히 업데이트 (알림 없이)
        fetchData();
      }
    } catch (error) {
      console.error('메모 저장 실패:', error);
    }
  };

  // 알림음 재생
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('알림음 재생 실패:', err));
    }
  };

  // 반복 고객 확인 (같은 전화번호)
  const getRepeatCount = (phone) => {
    return allApplicationsData.filter(app => app.phone === phone).length;
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

  // 월별 완료건 통계 계산
  const getMonthlyStats = () => {
    const monthlyData = {};

    // 최근 12개월 초기화
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { month: `${date.getMonth() + 1}월`, completed: 0, total: 0 };
    }

    // 완료건 집계
    allApplicationsData.forEach(app => {
      if (app.created_at) {
        const date = new Date(app.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (monthlyData[key]) {
          monthlyData[key].total += 1;
          if (app.status === 'completed') {
            monthlyData[key].completed += 1;
          }
        }
      }
    });

    return Object.values(monthlyData);
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">진호/정식 관리자</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>

        {/* 접속 중인 관리자 표시 */}
        {activeSessions.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-green-800">
                현재 접속 중: {activeSessions.length}명
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeSessions.map((session, idx) => (
                <div
                  key={session.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.id === sessionIdRef.current
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {session.browser}
                  {session.id === sessionIdRef.current && ' (나)'}
                  <span className="ml-1 text-xs opacity-75">
                    {session.loginTime?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-700 mt-2">
              💡 실시간 동기화 활성화 - 다른 관리자의 변경사항이 자동 반영됩니다
            </p>
          </div>
        )}

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
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-coway-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚙️ 환경설정
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

        {/* 알림음 */}
        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

        {/* 통계/캘린더 버튼 */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowStats(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
          >
            📊 월별 통계
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center gap-2"
          >
            📅 일정 캘린더
          </button>
        </div>

        {/* 검색 및 정렬 */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">🔍 고객 검색</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="이름, 전화번호, 주소로 검색..."
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coway-blue"
                />
                <button
                  onClick={handleSearch}
                  className="bg-coway-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-coway-navy transition whitespace-nowrap"
                >
                  찾기
                </button>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition whitespace-nowrap"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>
            {/* 정렬 */}
            <div className="md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">🔄 정렬</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coway-blue"
              >
                <option value="date">신청일순</option>
                <option value="name">이름순</option>
                <option value="area">지역순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col gap-4">
            {/* 상태 필터 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setFilter('all'); clearSearch(); }}
                className={`px-4 py-2 rounded ${
                  filter === 'all' && !searchQuery
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => { setFilter('pending'); clearSearch(); }}
                className={`px-4 py-2 rounded ${
                  filter === 'pending' && !searchQuery
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                대기중
              </button>
              <button
                onClick={() => { setFilter('confirmed'); clearSearch(); }}
                className={`px-4 py-2 rounded ${
                  filter === 'confirmed' && !searchQuery
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                컨택완료
              </button>
              <button
                onClick={() => { setFilter('completed'); clearSearch(); }}
                className={`px-4 py-2 rounded ${
                  filter === 'completed' && !searchQuery
                    ? 'bg-coway-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                완료
              </button>
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
                className={`border-b-2 border-gray-800 p-4 relative ${
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-lg text-gray-900">{app.name}</div>
                      {app.preferred_date && app.preferred_time && !viewArchived && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ✓ 컨택완료
                        </span>
                      )}
                      {getRepeatCount(app.phone) > 1 && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          🔄 {getRepeatCount(app.phone)}회차
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

                {/* 메모 입력 */}
                {!viewArchived && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-semibold text-yellow-800 mb-1">📝 메모</label>
                    <textarea
                      defaultValue={app.memo || ''}
                      placeholder="고객 관련 메모 입력..."
                      rows="2"
                      className="w-full border border-yellow-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      onBlur={(e) => {
                        if (e.target.value !== (app.memo || '')) {
                          updateMemo(app.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                )}

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
                        <div className="mt-3 pt-3 border-t-2 border-green-400 bg-green-100 -mx-3 px-3 pb-2 rounded-b-lg">
                          <div className="text-xs font-bold text-green-700 mb-1">📅 확정된 약속</div>
                          <div className="text-xl font-bold text-green-800">
                            {app.preferred_date || '-'} &nbsp;&nbsp; {app.preferred_time || ''}
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
              <tbody className="bg-white divide-y-2 divide-gray-800">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{app.name}</span>
                        {app.preferred_date && app.preferred_time && !viewArchived && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            ✓ 컨택완료
                          </span>
                        )}
                        {getRepeatCount(app.phone) > 1 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            🔄 {getRepeatCount(app.phone)}회차
                          </span>
                        )}
                      </div>
                      {/* 메모 (데스크톱) */}
                      {!viewArchived && (
                        <div className="mt-1">
                          <input
                            type="text"
                            defaultValue={app.memo || ''}
                            placeholder="메모..."
                            className="w-full border border-yellow-300 bg-yellow-50 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            onBlur={(e) => {
                              if (e.target.value !== (app.memo || '')) {
                                updateMemo(app.id, e.target.value);
                              }
                            }}
                          />
                        </div>
                      )}
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
                            <div className="mt-2 pt-2 border-t-2 border-green-400 bg-green-100 -mx-2 px-2 pb-2 rounded-b">
                              <div className="text-xs font-bold text-green-700 mb-1">📅 확정 약속</div>
                              <div className="text-sm font-bold text-green-800">
                                {app.preferred_date || '-'} &nbsp;&nbsp; {app.preferred_time || ''}
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

        {/* 통계 모달 */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📊 월별 완료건 통계</h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyStats()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name === 'completed' ? '완료' : '전체']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="completed" fill="#10B981" name="완료" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total" fill="#3B82F6" name="전체" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>완료건</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>전체 신청</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowStats(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 캘린더 모달 */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📅 일정 캘린더</h2>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* 월 선택 */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
                      setSelectedDate(null);
                    }}
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-bold"
                  >
                    ◀ 이전
                  </button>
                  <span className="text-xl font-bold">
                    {selectedMonth.getFullYear()}년 {selectedMonth.getMonth() + 1}월
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
                      setSelectedDate(null);
                    }}
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-bold"
                  >
                    다음 ▶
                  </button>
                </div>

                {/* 캘린더 그리드 */}
                <div className="grid grid-cols-7 gap-1">
                  {/* 요일 헤더 */}
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className={`text-center py-2 font-bold text-xs md:text-sm ${day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-gray-700'}`}>
                      {day}
                    </div>
                  ))}

                  {/* 날짜 */}
                  {(() => {
                    const year = selectedMonth.getFullYear();
                    const month = selectedMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];

                    // 빈 셀
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-10 md:h-20"></div>);
                    }

                    // 날짜 셀
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const appointments = allApplicationsData.filter(app =>
                        app.preferred_date === dateStr && app.status !== 'completed'
                      );

                      cells.push(
                        <div
                          key={day}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-10 md:h-20 border rounded p-1 text-xs overflow-hidden cursor-pointer transition hover:bg-blue-100 ${
                            selectedDate === dateStr
                              ? 'bg-blue-200 border-blue-500 ring-2 ring-blue-500'
                              : appointments.length > 0
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-gray-50'
                          }`}
                        >
                          <div className={`font-bold text-xs md:text-sm ${new Date(year, month, day).getDay() === 0 ? 'text-red-500' : new Date(year, month, day).getDay() === 6 ? 'text-blue-500' : ''}`}>
                            {day}
                          </div>
                          {/* 모바일: 숫자만 표시 */}
                          {appointments.length > 0 && (
                            <div className="block md:hidden text-center">
                              <span className="bg-blue-500 text-white text-xs px-1 rounded">{appointments.length}</span>
                            </div>
                          )}
                          {/* 데스크톱: 상세 표시 */}
                          <div className="hidden md:block">
                            {appointments.slice(0, 2).map((app, idx) => (
                              <div key={idx} className="bg-blue-500 text-white rounded px-1 mb-0.5 truncate">
                                {app.preferred_time} {app.name}
                              </div>
                            ))}
                            {appointments.length > 2 && (
                              <div className="text-blue-600 font-bold">+{appointments.length - 2}건</div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return cells;
                  })()}
                </div>

                {/* 일정 목록 (모바일 + 데스크톱) */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">
                      {selectedDate ? `📋 ${selectedDate} 일정` : '📋 이번 달 일정'}
                    </h3>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                      >
                        전체보기
                      </button>
                    )}
                  </div>
                  {(() => {
                    const year = selectedMonth.getFullYear();
                    const month = selectedMonth.getMonth();
                    const filteredApps = allApplicationsData
                      .filter(app => {
                        if (!app.preferred_date || app.status === 'completed') return false;

                        // 선택된 날짜가 있으면 해당 날짜만
                        if (selectedDate) {
                          return app.preferred_date === selectedDate;
                        }

                        // 없으면 해당 월 전체
                        const appDate = new Date(app.preferred_date);
                        return appDate.getFullYear() === year && appDate.getMonth() === month;
                      })
                      .sort((a, b) => {
                        if (a.preferred_date !== b.preferred_date) {
                          return a.preferred_date.localeCompare(b.preferred_date);
                        }
                        return (a.preferred_time || '').localeCompare(b.preferred_time || '');
                      });

                    if (filteredApps.length === 0) {
                      return <div className="text-gray-500 text-center py-4">예정된 일정이 없습니다</div>;
                    }

                    return filteredApps.map((app, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                        <div className="font-bold text-blue-800">
                          {app.preferred_date} &nbsp;&nbsp; {app.preferred_time}
                        </div>
                        <div className="text-gray-800">{app.name} - {app.phone}</div>
                        <div className="text-gray-600 text-sm truncate">{app.address}</div>
                      </div>
                    ));
                  })()}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  <div key={post.id} className="border-b-2 border-gray-800 p-4 hover:bg-gray-50">
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
                <tbody className="bg-white divide-y-2 divide-gray-800">
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

        {/* 환경설정 탭 */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">⚙️ 환경설정</h2>
              <p className="text-sm text-gray-600 mt-1">홈페이지 표시 문구를 설정합니다</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  홈페이지 커스텀 문구
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  아파트 이름 등을 입력하면 홈페이지 메인 문구 위에 표시됩니다.<br/>
                  예: "화명롯데캐슬카이저 입주민을 위한"
                </p>

                <textarea
                  value={customPrefixInput}
                  onChange={(e) => setCustomPrefixInput(e.target.value)}
                  placeholder="예: 화명롯데캐슬카이저 입주민을 위한"
                  rows="3"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-coway-blue"
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={saveSettings}
                    className="bg-coway-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-coway-navy transition"
                  >
                    💾 저장
                  </button>
                  <button
                    onClick={resetSettings}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    🔄 초기화
                  </button>
                </div>
              </div>

              {/* 미리보기 */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📱 미리보기</h3>
                <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
                  {customPrefixInput && (
                    <div className="text-yellow-400 text-lg md:text-xl font-bold mb-2">
                      {customPrefixInput}
                    </div>
                  )}
                  <div className="text-2xl md:text-3xl font-bold">
                    5만원 상당<br/>
                    매트리스 케어를<br/>
                    지금 100% 무료로!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
