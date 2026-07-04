<p align="center">
  <img src="./src/assets/humming-bird-title.svg" alt="Humming Bird" width="500" />
</p>

허밍을 업로드하면 AI가 완성된 음악을 만들어주는 웹 애플리케이션.
장르, 분위기, 악기, 키, 템포, 길이를 단계적으로 선택하고 자신의 멜로디를 녹음하거나 업로드하면, 백엔드 AI 엔진이 완성된 음악 파일을 생성합니다.

<p align="center">
<img alt="KakaoTalk_20260705_014326721" src="https://github.com/user-attachments/assets/172c6083-0238-48f4-abf7-25e66eafacb6" />
</p>


---

## 주요 기능

- **멜로디 업로드 / 실시간 녹음** — 시작·메인·끝 3구간 허밍을 MP3 파일로 업로드하거나 브라우저에서 직접 녹음
- **단계별 작곡 위저드** — 장르 → 분위기 → 악기 → 키 → 템포 → 길이를 직관적인 10단계 플로우로 선택
- **비동기 AI 음악 생성** — 백엔드 Job 시스템에 요청 후 완료될 때까지 실시간 진행률 폴링
- **생성 중 미니게임** — 로딩 대기 시간을 위한 캔버스 기반 Dino 스타일 게임
- **결과 재생 및 저장** — 생성된 음악을 브라우저에서 바로 재생, MP3 다운로드, 이름 지정 후 보관함 저장
- **내 보관함** — 로그인한 사용자별로 생성 음악 목록 관리, 이름 수정·재생·다운로드·삭제
- **참고 이미지 업로드** — 분위기 레퍼런스 이미지를 함께 전달하여 AI 생성 방향 지시

---

## 실행 방법

### 요구사항

- Node.js 18+
- npm 9+

### 개발 서버

```bash
npm install
npm run dev
```

기본적으로 `/api` 경로는 Vite 프록시를 통해 백엔드 서버로 전달됩니다.

### 환경변수 설정

```bash
# .env.development (기본값 사용 시 생략 가능)
VITE_API_BASE_URL=/api

# .env.production
VITE_API_BASE_URL=https://your-backend-url/api
```

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

## 기술 스택

| 분류          | 라이브러리         | 버전 |
| ------------- | ------------------ | ---- |
| UI 프레임워크 | React              | 19.1 |
| 언어          | TypeScript         | 5.9  |
| 빌드 도구     | Vite               | 7.1  |
| 라우팅        | React Router       | 7.9  |
| 스타일링      | Tailwind CSS       | 4.1  |
| HTTP          | Fetch API (native) | —    |

**외부 서비스**

- AWS S3 — 오디오 파일 저장
- 백엔드 AI 엔진 — `/api/compose` 엔드포인트로 음악 생성 요청

---

## 폴더 구조

```
src/
├── api/                    # 백엔드 API 호출 함수
│   ├── authApi.ts          # 회원가입 / 로그인 / 로그아웃
│   ├── createComposition.tsx # 작곡 요청
│   ├── checkJobStatus.tsx  # Job 상태 폴링
│   └── uploadAudio.tsx     # S3 오디오 업로드
│
├── components/             # 재사용 UI 컴포넌트
│   ├── button.tsx          # 7가지 버튼 변형
│   ├── textInput.tsx       # 자동 리사이즈 텍스트 입력
│   ├── audioFile.tsx       # 3구간 오디오 업로드/녹음
│   ├── optionCard.tsx      # 그리드 선택 카드
│   ├── questionLayout.tsx  # 질문 페이지 공통 레이아웃
│   ├── visualUploader.tsx  # 이미지 업로드 (drag & drop)
│   ├── GlobalHeader.tsx    # 인증 상태 반영 헤더
│   ├── CursorSparkles.tsx  # 커서 파티클 캔버스 효과
│   ├── DinoGame.tsx        # 로딩 중 미니게임
│   └── MusicGeneratingLoader.tsx # 생성 중 로딩 화면
│
├── layout/
│   └── AppLayout.tsx       # 공통 레이아웃 + 페이지 트랜지션
│
├── pages/                  # 라우트 페이지 (13개)
│   ├── A_startPage.tsx     # 인트로
│   ├── B_mainPage.tsx      # 오디오 업로드
│   ├── C_visualUploadPage.tsx
│   ├── D_whatPage1.tsx     # 장르 선택
│   ├── E_whatPage2.tsx     # 무드 선택
│   ├── F_instrumentPage.tsx
│   ├── G_keyPage.tsx
│   ├── H_tempoPage.tsx
│   ├── I_lengthPage.tsx
│   ├── J_reviewPage.tsx    # 리뷰 + 생성 요청
│   ├── K_musicResultPage.tsx # 결과 재생 + 저장
│   ├── L_myPage.tsx        # 내 보관함
│   ├── M_loginPage.tsx
│   └── N_signupPage.tsx
│
├── router/
│   └── root.tsx            # React Router 설정 (lazy loading)
│
└── utils/
    ├── auth.ts             # 토큰 + 사용자 상태 관리
    ├── compositionSession.ts # 위저드 답변 sessionStorage 관리
    ├── musicStorage.ts     # 저장된 음악 localStorage 관리
    └── valueLabels.ts      # 선택값 → 표시 텍스트 변환
```

---

## 아키텍처 설명

### 작곡 위저드 플로우

```
시작 → 오디오 업로드 → [이미지 업로드] → 장르 → 무드 → 악기 → 키 → 템포 → 길이 → 리뷰 → 결과
  A         B               C              D      E      F      G      H       I      J       K
```

각 단계의 선택값은 `sessionStorage`에 저장됩니다. 이를 통해 페이지 이동·새로고침 시에도 이전 답변이 유지되며, 리뷰 페이지에서 개별 단계로 돌아가 수정 후 복귀할 수 있습니다.

### 비동기 음악 생성

```
ReviewPage
  └─ POST /api/compose
       └─ 응답: { jobId }
            └─ pollJobUntilComplete(jobId, { intervalMs: 3000, maxAttempts: 100 })
                 └─ GET /api/job/{jobId} 반복 (최대 5분)
                      └─ status: SUCCEEDED → { musicUrl }
                           └─ navigate("/musicResult")
```

생성 요청과 결과 수신이 분리된 비동기 아키텍처입니다. 생성 중에는 진행률(progress %)을 주기적으로 확인하며 로딩 화면에 표시합니다.

### 인증 흐름

```
로그인 → accessToken → localStorage["auth:token"]
                            └─ API 요청 시 Authorization: Bearer {token} 헤더에 자동 추가
                            └─ 새로고침 시 localStorage에서 복구
```

### 데이터 저장 계층

| 저장소           | 용도                                    | 범위           |
| ---------------- | --------------------------------------- | -------------- |
| `sessionStorage` | 위저드 진행 중 선택값, 마지막 API 응답  | 탭 단위        |
| `localStorage`   | JWT 토큰, 사용자 정보, 생성된 음악 목록 | 브라우저 단위  |
| AWS S3           | 업로드된 오디오 파일                    | 서버 영구 저장 |
