# 변경 이력

## 2025-01-17 (오늘)

### 진드기사진 페이지 구현
- 메뉴에 "진드기사진" 추가
- MitesPage.jsx 생성
  - 15개 진드기 현미경 사진 갤러리
  - 빨강/주황 그라데이션 디자인
  - 진드기 통계 (200만 마리, 0.3mm, 3개월)
  - 건강 위협 정보 (알레르기, 아토피, 천식, 수면장애)
- `/client/public/images/` 폴더에 mite1.png ~ mite15.png 추가

### 모바일 최적화
- Header.jsx에 햄버거 메뉴 추가
  - useState로 메뉴 열기/닫기 상태 관리
  - 모바일에서 메뉴 아이콘 클릭 시 드롭다운
  - 메뉴 항목: 홈, 무료 케어 신청, 진드기사진, 후기 게시판, 관리자
  - 클릭 시 자동으로 메뉴 닫힘

### UX 개선
- 모든 페이지에 `useEffect(() => window.scrollTo(0, 0), [])` 추가
  - ApplicationPage, HomePage, BoardPage
  - BoardDetailPage, BoardWritePage, MitesPage, AdminPage
- 페이지 전환 시 항상 맨 위에서 시작

### 텍스트 수정
- BoardPage: "고객님들의" → "분들의" (모바일 한 줄 표시)

### SEO 및 공유 최적화
- `client/index.html` 수정
  - 페이지 제목: "client" → "무상매트리스케어 - 무료 매트리스 진드기 제거 서비스"
  - Open Graph 메타 태그 추가 (카카오톡, 페이스북 공유)
  - Twitter Card 메타 태그 추가
  - description, keywords 메타 태그
  - og:url, og:locale 추가
  - 언어 설정: en → ko

### 홈 화면 개선
- 진드기 사진 보기 버튼 추가
  - 위치: 무료 신청 버튼과 후기 보기 버튼 사이
  - 빨강→주황 그라데이션
  - "⚠️ 진드기 사진 보기 (충격주의)"
  - 클릭 시 /mites로 이동

## 이전 작업 내용

### 관리자 페이지 후기 관리
- AdminPage에 탭 시스템 추가 (신청 관리 / 후기 관리)
- 후기 게시판 목록 조회 및 삭제 기능
- DELETE /api/posts/:id 엔드포인트 (댓글 자동 삭제)

### 별점 시스템
- BoardWritePage: 1~5 별점 선택 UI
- BoardPage: 목록에 별점 표시
- BoardDetailPage: 상세 페이지에 별점 표시
- API: rating 필드 추가

### 모바일 관리자 페이지
- 상태 변경 드롭다운 크기 확대
- "상태 변경" 라벨 추가
- 버튼 크기 및 아이콘 개선

### 홈페이지 디자인
- 히어로 섹션 줄 간격 조정 (lineHeight: 1.5)
- "전문 상담사가" → "전문가가" (모바일 한 줄 표시)
- 가격 변경: 15만원 → 5만원

### 서버 측 필터링 → 클라이언트 필터링
- Vercel에서 query parameter 문제 해결
- `/api/applications?status=pending` 404 에러 수정
- 전체 데이터를 가져와서 클라이언트에서 필터링

### Firestore orderBy 제거
- 모든 orderBy 제거 (인덱스 에러 방지)
- 클라이언트 측에서 .sort()로 정렬
