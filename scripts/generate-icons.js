/**
 * PWA 아이콘 생성 스크립트
 * 
 * 사용법:
 * 1. public/icon-base.svg 파일 준비 (512x512 권장)
 * 2. npm install sharp (이미지 처리 라이브러리)
 * 3. node scripts/generate-icons.js
 * 
 * 또는 온라인 도구 사용:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require("fs");
const path = require("path");

// SVG로 간단한 아이콘 생성 (임시용)
function generateSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="${size}" height="${size}" fill="#4F46E5" rx="${size * 0.2}"/>
  
  <!-- 명함 아이콘 -->
  <g transform="translate(${size * 0.2}, ${size * 0.25})">
    <rect x="0" y="0" width="${size * 0.6}" height="${size * 0.4}" fill="white" rx="${size * 0.03}"/>
    <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.2}" height="${size * 0.08}" fill="#4F46E5" rx="${size * 0.01}"/>
    <rect x="${size * 0.05}" y="${size * 0.15}" width="${size * 0.35}" height="${size * 0.03}" fill="#E5E7EB" rx="${size * 0.005}"/>
    <rect x="${size * 0.05}" y="${size * 0.2}" width="${size * 0.25}" height="${size * 0.03}" fill="#E5E7EB" rx="${size * 0.005}"/>
  </g>
  
  <!-- 텍스트 -->
  <text x="${size * 0.5}" y="${size * 0.82}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.12}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle">명함</text>
</svg>`;
}

// 임시 SVG 아이콘 생성
const iconsDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log("🎨 PWA 아이콘 생성 중...\n");

sizes.forEach((size) => {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ ${filename} (SVG) 생성 완료`);
});

// Maskable 아이콘 (안전 영역 포함)
const maskableSVG = generateSVGIcon(512);
fs.writeFileSync(path.join(iconsDir, "icon-192x192-maskable.svg"), maskableSVG);
fs.writeFileSync(path.join(iconsDir, "icon-512x512-maskable.svg"), maskableSVG);

console.log("\n✨ 아이콘 생성 완료!");
console.log("\n⚠️  주의: SVG 아이콘은 임시입니다.");
console.log("   실제 배포 시에는 PNG 이미지로 변환해야 합니다.\n");
console.log("📦 PNG 변환 방법:");
console.log("   1. npm install sharp");
console.log("   2. 아래 코드를 이 파일에 추가하여 실행\n");

console.log("🌐 추천 온라인 도구:");
console.log("   - https://realfavicongenerator.net/");
console.log("   - https://www.pwabuilder.com/imageGenerator");
console.log("   - https://favicon.io/\n");

