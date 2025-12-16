# PWA (Progressive Web App) 설정 가이드

명함 관리 앱을 PWA로 설정하여 앱처럼 사용하는 방법입니다.

## 📱 PWA란?

Progressive Web App은 웹 기술로 만들어진 앱을 마치 네이티브 앱처럼 사용할 수 있게 하는 기술입니다.

### PWA 주요 기능

✅ **홈 화면에 추가**
- 브라우저 없이 앱처럼 실행
- 자체 아이콘과 스플래시 화면

✅ **오프라인 지원**
- 인터넷 없이도 기본 기능 사용
- 캐시된 데이터 접근

✅ **푸시 알림** (준비 완료)
- 연락 추천 알림
- 중요한 업데이트 알림

✅ **카메라 접근**
- 명함 스캔 기능
- 사진 촬영 및 업로드

✅ **빠른 로딩**
- Service Worker 캐싱
- 네트워크 최적화

## 🚀 설치 방법

### iOS (iPhone/iPad)

1. **Safari에서 앱 열기**
   - Safari 브라우저 필수 (Chrome 불가)

2. **공유 버튼 클릭**
   - 하단 중앙의 공유 아이콘 (📤)

3. **"홈 화면에 추가" 선택**
   - 아래로 스크롤하여 찾기

4. **이름 확인 후 "추가" 클릭**
   - 기본 이름: "명함관리"

5. **홈 화면에서 앱 실행**
   - 아이콘을 탭하여 실행

### Android

1. **Chrome에서 앱 열기**

2. **메뉴 열기**
   - 우측 상단 ⋮ 버튼

3. **"홈 화면에 추가" 선택**
   - 또는 "앱 설치" 선택

4. **"설치" 클릭**
   - 자동으로 앱 아이콘 생성

5. **앱 서랍에서 실행**
   - 다른 앱처럼 사용

### Desktop (Windows/Mac)

1. **Chrome에서 앱 열기**

2. **주소창 우측 아이콘 클릭**
   - 컴퓨터 모니터 모양 아이콘

3. **"설치" 클릭**

4. **데스크톱에서 실행**
   - 독립 창으로 실행

## 📦 개발 환경 설정

### 1. 패키지 설치

이미 설치되어 있습니다:

```bash
npm install @ducanh2912/next-pwa
npm install sharp
```

### 2. Service Worker 생성

프로덕션 빌드 시 자동으로 생성됩니다:

```bash
npm run build
```

생성되는 파일:
- `public/sw.js` - Service Worker
- `public/workbox-*.js` - Workbox 라이브러리

### 3. 아이콘 재생성

```bash
# SVG 아이콘 생성
node scripts/generate-icons.js

# PNG로 변환
node scripts/convert-icons-to-png.js
```

## 🎨 아이콘 커스터마이징

### 온라인 도구 사용 (추천)

1. **[PWA Builder](https://www.pwabuilder.com/imageGenerator)**
   - 512x512 이미지 업로드
   - 모든 크기 자동 생성
   - 다운로드 후 `public/icons/` 폴더에 복사

2. **[Real Favicon Generator](https://realfavicongenerator.net/)**
   - 완벽한 파비콘 생성
   - 모든 플랫폼 지원

3. **[Favicon.io](https://favicon.io/)**
   - 텍스트에서 아이콘 생성
   - 무료 사용

### 직접 생성

`public/icon-base.svg` 파일을 준비하고:

```bash
node scripts/generate-icons.js
node scripts/convert-icons-to-png.js
```

## 🔧 설정 파일

### manifest.json

PWA 설정 파일 (`public/manifest.json`):

```json
{
  "name": "명함 관리 앱",
  "short_name": "명함관리",
  "description": "명함을 스캔하고 관리하며 AI로 연락을 추천받는 앱",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4F46E5",
  "background_color": "#ffffff"
}
```

### next.config.ts

Service Worker 설정:

```typescript
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});
```

## 📱 기능별 설정

### 1. 카메라 접근

이미 설정됨:

```html
<meta
  httpEquiv="Permissions-Policy"
  content="camera=*, microphone=(), geolocation=()"
/>
```

### 2. 오프라인 지원

- 오프라인 페이지: `/offline`
- 자동 캐싱 (Service Worker)
- 네트워크 우선 전략

### 3. 푸시 알림 (준비 완료)

```typescript
// 향후 구현 예정
// Service Worker에서 push 이벤트 리스닝
self.addEventListener('push', (event) => {
  // 알림 표시
});
```

## 🧪 테스트 방법

### 로컬 테스트

1. **프로덕션 빌드**
   ```bash
   npm run build
   npm start
   ```

2. **Chrome DevTools**
   - F12 → Application 탭
   - Service Workers 확인
   - Manifest 확인

3. **Lighthouse**
   - F12 → Lighthouse 탭
   - PWA 카테고리 실행
   - 100점 목표

### PWA 체크리스트

- ✅ HTTPS 사용 (배포 시)
- ✅ Manifest 파일 존재
- ✅ Service Worker 등록
- ✅ 아이콘 192x192, 512x512
- ✅ 오프라인 페이지
- ✅ 메타 태그 설정

## 🌐 배포 후 확인사항

### Vercel 배포

1. **자동 HTTPS**
   - Vercel이 자동 제공

2. **헤더 설정** (`vercel.json`)
   ```json
   {
     "headers": [
       {
         "source": "/sw.js",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=0, must-revalidate"
           }
         ]
       }
     ]
   }
   ```

3. **환경변수**
   - Dashboard에서 설정

### Chrome PWA 설치 가능 확인

1. 주소창에서 ⊕ 아이콘 표시
2. "설치" 버튼 표시
3. 설치 후 독립 창 실행

### iOS PWA 확인

1. Safari 필수
2. 홈 화면 추가 가능
3. 전체 화면 실행
4. 상태바 색상 적용

## 📊 캐싱 전략

### 현재 설정

| 리소스 | 전략 | 캐시 기간 |
|--------|------|-----------|
| 폰트 | CacheFirst | 1년 |
| 이미지 | StaleWhileRevalidate | 24시간 |
| JS/CSS | StaleWhileRevalidate | 24시간 |
| API | NetworkFirst | 24시간 |
| 기타 | NetworkFirst | 24시간 |

### 전략 설명

- **CacheFirst**: 캐시 우선, 오프라인 최적
- **NetworkFirst**: 네트워크 우선, 최신 데이터
- **StaleWhileRevalidate**: 캐시 사용 + 백그라운드 업데이트

## 🐛 문제 해결

### Service Worker가 업데이트되지 않음

```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});

// 페이지 새로고침
location.reload();
```

### 아이콘이 표시되지 않음

1. 아이콘 파일 존재 확인
2. Manifest 경로 확인
3. 브라우저 캐시 삭제
4. 하드 리프레시 (Ctrl+Shift+R)

### iOS에서 전체 화면이 안됨

- Safari 필수 (Chrome X)
- `display: "standalone"` 확인
- Apple 메타 태그 확인

### 캐시가 너무 오래 유지됨

```bash
# Service Worker 재배포
npm run build
# 버전 번호 변경 (자동)
```

## 🎯 성능 최적화

### Lighthouse 점수 향상

1. **PWA**
   - Manifest 완성도: 100%
   - Service Worker: 등록됨
   - 오프라인 지원: 가능

2. **Performance**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략

3. **Best Practices**
   - HTTPS 사용
   - 보안 헤더
   - 최신 라이브러리

## 📚 추가 리소스

- [PWA Builder](https://www.pwabuilder.com/)
- [Next.js PWA 문서](https://ducanh-next-pwa.vercel.app/)
- [Web.dev PWA 가이드](https://web.dev/progressive-web-apps/)
- [MDN Service Worker](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API)

## 🔔 푸시 알림 (향후 구현)

준비 완료. 다음 기능 구현 예정:

- 연락 추천 알림
- 중요 업데이트 알림
- 맞춤 알림 설정

```typescript
// 푸시 알림 권한 요청
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // 알림 구독
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });
}
```

## 문의

PWA 설정 관련 문의사항은 이슈를 등록해주세요.

