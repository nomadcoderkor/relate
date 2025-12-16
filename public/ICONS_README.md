# PWA 아이콘 생성 가이드

현재 `manifest.json`은 `favicon.ico`를 임시로 사용하고 있습니다.

## 🎨 PWA 아이콘 생성 방법

### 옵션 1: 온라인 도구 사용 (권장)

1. **Favicon Generator** 사용
   - https://favicon.io/favicon-generator/ 접속
   - 텍스트, 이모지, 또는 이미지로 아이콘 생성
   - 다운로드 후 `/public` 폴더에 압축 해제

2. **PWA Asset Generator** 사용
   - https://www.pwabuilder.com/imageGenerator 접속
   - 512x512 이미지 업로드
   - 모든 사이즈 자동 생성

### 옵션 2: 명령어로 생성

```bash
# ImageMagick 설치 (Mac)
brew install imagemagick

# 텍스트로 아이콘 생성
convert -size 192x192 -background "#4F46E5" -fill white \
  -gravity center -font Arial-Bold -pointsize 120 \
  label:"명" public/icon-192x192.png

convert -size 512x512 -background "#4F46E5" -fill white \
  -gravity center -font Arial-Bold -pointsize 360 \
  label:"명" public/icon-512x512.png
```

### 옵션 3: 디자인 도구 사용

1. **Figma/Canva**에서 512x512 이미지 생성
2. 배경: `#4F46E5` (인디고)
3. 아이콘/텍스트: 흰색
4. PNG로 내보내기
5. `/public` 폴더에 저장

## 📝 필요한 아이콘 사이즈

- `icon-192x192.png` - 192x192px (필수)
- `icon-512x512.png` - 512x512px (필수)
- `favicon.ico` - 32x32px (기본 제공됨)

## 🔄 아이콘 생성 후

1. 아이콘 파일을 `/public` 폴더에 저장
2. `manifest.json`을 다음과 같이 업데이트:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

3. 브라우저 새로고침

## 🎯 빠른 임시 아이콘

이모지를 아이콘으로 사용:
- https://favicon.io/emoji-favicons/credit-card/ 
- 명함 이모지 다운로드
- `/public` 폴더에 저장

