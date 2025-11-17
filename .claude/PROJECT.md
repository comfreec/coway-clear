# 무상매트리스케어 프로젝트

## 프로젝트 개요
무료 매트리스 케어 서비스 웹사이트
- **목적**: 매트리스 진드기 제거 무료 서비스 신청 및 홍보
- **가격**: 5만원 상당의 서비스를 100% 무료로 제공
- **주요 기능**: 서비스 신청, 후기 게시판, 관리자 페이지, 진드기 사진 갤러리

## 기술 스택
### Frontend
- React + Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Vercel Serverless Functions
- Firebase Firestore (데이터베이스)

### 배포
- Vercel 자동 배포
- URL: https://free-clean-mattress.vercel.app

## 프로젝트 구조
```
coway-clear/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/         # 페이지 컴포넌트
│   │   │   ├── HomePage.jsx
│   │   │   ├── ApplicationPage.jsx
│   │   │   ├── MitesPage.jsx
│   │   │   ├── BoardPage.jsx
│   │   │   ├── BoardWritePage.jsx
│   │   │   ├── BoardDetailPage.jsx
│   │   │   └── AdminPage.jsx
│   │   └── main.jsx
│   └── public/
│       └── images/        # 진드기 이미지 (mite1.png ~ mite15.png)
├── api/
│   └── index.js          # Vercel Serverless Function
└── .claude/
    └── PROJECT.md        # 이 파일
```

## 주요 페이지
1. **홈페이지** (`/`)
   - 히어로 섹션 (5만원 혜택 강조)
   - 진드기 경고 문구
   - 3개 버튼: 무료 신청, 진드기 사진 보기, 고객 후기 보기
   - 서비스 소개
   - FAQ 섹션

2. **신청 페이지** (`/application`)
   - 이름, 전화번호, 주소, 매트리스 정보 입력
   - 페이지 로드 시 자동 스크롤 맨 위로

3. **진드기사진 페이지** (`/mites`)
   - 15개 진드기 현미경 사진 갤러리
   - 빨강/주황 경고 색상 테마
   - 진드기 통계 정보 (200만 마리, 0.3mm, 3개월)
   - 건강 위협 정보

4. **후기 게시판** (`/board`)
   - 게시글 목록 (별점 포함)
   - 모바일/데스크톱 반응형 레이아웃
   - 글쓰기 버튼

5. **글쓰기** (`/board/write`)
   - 별점 선택 (1~5점)
   - 제목, 내용, 작성자, 비밀번호

6. **관리자 페이지** (`/admin`)
   - 비밀번호: admin123
   - 2개 탭: 신청 관리 / 후기 관리
   - 신청 관리: 상태 변경 (대기중/확정/완료), 삭제
   - 후기 관리: 게시글 삭제

## API 엔드포인트
### 신청 관련
- `POST /api/applications` - 신청 등록
- `GET /api/applications` - 신청 목록 조회
- `PATCH /api/applications/:id` - 상태 업데이트
- `DELETE /api/applications/:id` - 신청 삭제

### 게시판 관련
- `GET /api/posts` - 게시글 목록 (rating 포함)
- `GET /api/posts/:id` - 게시글 상세 (조회수 증가)
- `POST /api/posts` - 게시글 작성 (rating 포함)
- `DELETE /api/posts/:id` - 게시글 삭제 (댓글 자동 삭제)
- `GET /api/posts/:id/comments` - 댓글 목록
- `POST /api/posts/:id/comments` - 댓글 작성

### 기타
- `GET /api/stats` - 통계 조회
- `GET /api/products` - 제품 목록
- `GET /api/reviews` - 리뷰 목록
- `POST /api/reviews` - 리뷰 작성

## 주요 기능 특징
1. **모바일 최적화**
   - 햄버거 메뉴 (메뉴 열기/닫기)
   - 반응형 디자인 (모바일/데스크톱)
   - 터치 친화적 UI

2. **UX 개선**
   - 페이지 전환 시 자동 스크롤 맨 위로
   - 호버 효과 (확대, 색상 변경)
   - 로딩 상태 표시

3. **SEO 최적화**
   - Open Graph 메타 태그 (카카오톡 공유)
   - 페이지 제목: "무상매트리스케어"
   - 설명 메타 태그

## 색상 테마
- **메인 블루**: `#0066CC` (coway-blue)
- **진한 블루**: `#004A99` (coway-navy)
- **경고 빨강**: `#EF4444` ~ `#F97316` (진드기 페이지)
- **강조 노랑**: `#FBBF24` (무료 신청 버튼)

## 데이터베이스 (Firestore)
### Collections
- `applications` - 신청 정보
  - name, phone, address, detail_address
  - mattress_type, mattress_age
  - preferred_date, preferred_time, message
  - status (pending/confirmed/completed)
  - created_at

- `posts` - 게시글
  - title, content, author, password
  - rating (1~5)
  - views
  - created_at

- `comments` - 댓글
  - post_id
  - author, content
  - created_at

- `products` - 제품 정보
- `reviews` - 리뷰

## Git 커밋 규칙
- 형식: `기능 추가:`, `수정:`, `디자인 개선:` 등
- 마지막에 Claude Code 서명 포함

## 배포 프로세스
1. 코드 수정
2. `git add .`
3. `git commit -m "메시지"`
4. `git push origin main`
5. Vercel 자동 배포 (약 1-2분)

## 환경 변수 (Vercel)
- `FIREBASE_SERVICE_ACCOUNT` - Firebase 서비스 계정 JSON
- 또는 개별 환경변수:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

## 최근 주요 업데이트
- 진드기사진 페이지 추가 (15개 이미지)
- 모바일 햄버거 메뉴 추가
- 페이지 로드 시 자동 스크롤 리셋
- 후기 게시판 별점 시스템
- 관리자 페이지 후기 관리 기능
- 홈 화면에 진드기 사진 보기 버튼 추가
- Open Graph 메타 태그 (카카오톡 공유)
