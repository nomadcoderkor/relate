# OCR.space API 설정 가이드 (무료)

OCR.space는 **무료 API 키**를 제공하며, Google Vision보다 설정이 훨씬 간단합니다.

---

## 🚀 빠른 설정 (2분)

### 1단계: 무료 API 키 발급

#### 1-1. OCR.space 웹사이트 접속
https://ocr.space/ocrapi

#### 1-2. 무료 API 키 신청
1. **"Get your Free API Key"** 버튼 클릭
2. 이메일 주소 입력
3. **"I'm not a robot"** 체크
4. **"Get Free API Key"** 클릭

#### 1-3. API 키 받기
- 입력한 이메일로 **즉시 API 키 전송**
- 이메일 제목: "Your OCR.space API Key"

**무료 티어 제한:**
- ✅ 월 25,000 요청
- ✅ 초당 0.5 요청
- ✅ 상업적 사용 가능
- ✅ 신용카드 불필요

---

### 2단계: 환경변수 설정

#### 2-1. `.env.local` 파일 수정

```bash
# 기존:
GOOGLE_CLOUD_VISION_API_KEY=your_old_key

# 변경:
OCR_SPACE_API_KEY=helloworld  # 여기에 받은 API 키 입력
```

#### 2-2. API 키 입력 예시

이메일로 받은 API 키를 복사하여 붙여넣기:

```bash
OCR_SPACE_API_KEY=K87654321234567890
```

---

### 3단계: 개발 서버 재시작

```bash
# 터미널에서 Ctrl+C로 서버 중단 후
npm run dev
```

---

## ✅ 테스트

### 1. 명함 스캔 테스트
1. 로그인 → 명함 목록
2. **"📷 명함 스캔"** 클릭
3. 명함 이미지 선택
4. **OCR 분석 실행**
5. 추출된 정보 확인

### 2. 터미널 로그 확인
```bash
# 성공 시:
POST /api/ocr 200 in 2000ms

# 실패 시:
OCR.space error: ...
```

---

## 🔍 OCR.space vs Google Vision

| 항목 | OCR.space | Google Vision |
|------|-----------|---------------|
| **설정 난이도** | ⭐ 쉬움 | ⭐⭐⭐⭐ 어려움 |
| **API 키** | 이메일만 | 서비스 계정 + JSON |
| **무료 티어** | 25,000 요청/월 | 1,000 요청/월 |
| **한국어 지원** | ✅ 우수 | ✅ 최고 |
| **정확도** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **상업적 사용** | ✅ 가능 | ✅ 가능 |

---

## 🎯 지원 언어

OCR.space는 다음 언어를 지원합니다:
- ✅ **한국어 (kor)**
- ✅ 영어 (eng)
- ✅ 중국어 (chs, cht)
- ✅ 일본어 (jpn)
- 기타 25개 이상 언어

---

## 🔧 고급 설정

### OCR 엔진 선택

`.env.local`에 추가:

```bash
# OCR Engine 1: 빠름, 기본
OCR_ENGINE=1

# OCR Engine 2: 느림, 더 정확 (권장)
OCR_ENGINE=2
```

### 언어 설정

한국어 + 영어 동시 인식:

```typescript
// lib/ocr/google-vision.ts
formData.append("language", "kor,eng");
```

---

## 🚨 문제 해결

### 1. API 키 오류
```
OCR_SPACE_API_KEY is not configured
```

**해결:**
1. `.env.local` 파일 확인
2. `OCR_SPACE_API_KEY=` 뒤에 키 입력
3. 개발 서버 재시작

### 2. 요청 제한 초과
```
Rate limit exceeded
```

**해결:**
- 무료 티어: 초당 0.5 요청 (2초에 1회)
- Paid 티어로 업그레이드 고려

### 3. 텍스트 인식 실패
```
No text detected in the image
```

**해결:**
1. 이미지 품질 확인 (해상도, 밝기)
2. OCR Engine 2 사용
3. 이미지 크기 조정 (너무 크거나 작으면 안됨)

### 4. CORS 오류 (브라우저)
```
CORS policy error
```

**해결:**
- OCR.space API는 서버사이드에서만 호출
- 클라이언트에서 직접 호출 금지

---

## 📊 API 사용량 확인

OCR.space Dashboard:
https://ocr.space/ocrapi/account

- 사용한 요청 수
- 남은 요청 수
- API 키 재발급

---

## 🎉 완료!

이제 다음 기능이 작동합니다:
- ✅ 명함 이미지 업로드
- ✅ OCR 텍스트 추출
- ✅ 자동 정보 파싱
- ✅ 명함 데이터 저장

---

## 💡 팁

### 1. 명함 사진 촬영 가이드
- 📸 조명 밝게
- 📐 명함을 평평하게
- 🔍 초점 맞추기
- 📏 명함이 화면의 80% 차지

### 2. OCR 정확도 향상
- 고해상도 카메라 사용
- 배경 단순하게
- 명함 테두리 명확히
- 그림자 최소화

### 3. 개발 모드
테스트용 mock 데이터 사용:

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=true  # Mock OCR 사용
NEXT_PUBLIC_DEV_MODE=false # 실제 OCR 사용
```

---

## 🔗 참고 링크

- OCR.space 공식 문서: https://ocr.space/ocrapi
- API 가격: https://ocr.space/ocrapi/pricing
- 지원 언어: https://ocr.space/ocrapi/languages

---

## ⚠️ 주의사항

1. **API 키 보안**
   - `.env.local` 파일은 Git에 커밋하지 말 것
   - 프론트엔드에서 API 키 노출 금지

2. **무료 티어 제한**
   - 월 25,000 요청
   - 초당 0.5 요청
   - 제한 초과 시 유료 플랜 고려

3. **프로덕션 배포**
   - Vercel 환경변수에 `OCR_SPACE_API_KEY` 추가
   - `.env.example` 파일에 키 이름 문서화

---

설정 완료 후 명함 스캔을 테스트해보세요! 🎊
