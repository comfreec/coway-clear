# Claude Code 작업 재개 가이드

## 새로운 세션에서 작업 시작하기

Claude Code를 다시 시작했을 때, 다음 파일들을 읽어주세요:

```
1. .claude/PROJECT.md - 프로젝트 전체 개요
2. .claude/CHANGELOG.md - 최근 변경 사항
3. .claude/README.md - 이 파일 (가이드)
```

## 빠른 시작 명령어

### 파일 읽기
```
"먼저 .claude/PROJECT.md와 CHANGELOG.md를 읽어줘"
```

### 현재 상태 확인
```
git status
```

### 로컬 서버 실행
```
cd client
npm run dev
```

### 배포
```
git add .
git commit -m "커밋 메시지"
git push origin main
```
→ Vercel이 자동으로 배포합니다

## 자주 하는 작업

### 1. 페이지 수정
- 파일 위치: `client/src/pages/*.jsx`
- 예: HomePage.jsx, ApplicationPage.jsx 등

### 2. API 수정
- 파일 위치: `api/index.js`
- Firestore 쿼리는 여기서 처리

### 3. 스타일 수정
- Tailwind CSS 사용
- className에서 직접 스타일 지정

### 4. 이미지 추가
- 위치: `client/public/images/`
- 사용: `<img src="/images/파일명.png" />`

## 중요한 정보

### 관리자 비밀번호
- 비밀번호: `admin123`
- 위치: AdminPage.jsx

### 배포 URL
- https://free-clean-mattress.vercel.app

### Firebase 설정
- Vercel 환경변수에 설정됨
- `FIREBASE_SERVICE_ACCOUNT` 또는 개별 환경변수

## 알아두면 좋은 것

### 페이지 라우팅
```javascript
/ - 홈페이지
/application - 신청 페이지
/mites - 진드기사진 페이지
/board - 후기 게시판
/board/write - 글쓰기
/board/:id - 게시글 상세
/admin - 관리자 페이지
```

### 주요 컴포넌트
- Header.jsx - 상단 메뉴 (햄버거 메뉴 포함)
- Footer.jsx - 하단 푸터

### 색상 커스텀 (tailwind.config.js)
```javascript
colors: {
  'coway-blue': '#0066CC',
  'coway-navy': '#004A99'
}
```

## 문제 해결

### 1. 이미지가 안 보일 때
- 파일 위치 확인: `client/public/images/`
- 경로 확인: `/images/파일명` (앞에 / 필요)

### 2. API 오류
- Vercel 로그 확인
- Firestore 연결 확인

### 3. 배포가 안 될 때
- `git push` 확인
- Vercel 대시보드 확인

## 다음 작업 시작할 때

```
안녕! 무상매트리스케어 프로젝트 이어서 작업하려고 해.
먼저 .claude/PROJECT.md와 CHANGELOG.md를 읽어서
지금까지 무슨 작업을 했는지 확인해줄래?
```

이렇게 요청하면 제가 프로젝트 컨텍스트를 빠르게 파악하고 바로 작업을 이어갈 수 있습니다!
