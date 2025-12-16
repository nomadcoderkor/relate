/**
 * SVG 아이콘을 PNG로 변환
 * 
 * 사용법:
 * npm install sharp
 * node scripts/convert-icons-to-png.js
 */

const fs = require("fs");
const path = require("path");

async function convertSVGtoPNG() {
  try {
    // sharp 모듈 확인
    const sharp = require("sharp");
    
    const iconsDir = path.join(__dirname, "../public/icons");
    const files = fs.readdirSync(iconsDir);
    
    console.log("🔄 SVG를 PNG로 변환 중...\n");
    
    for (const file of files) {
      if (file.endsWith(".svg")) {
        const svgPath = path.join(iconsDir, file);
        const pngPath = path.join(iconsDir, file.replace(".svg", ".png"));
        
        const svgBuffer = fs.readFileSync(svgPath);
        
        await sharp(svgBuffer)
          .png()
          .toFile(pngPath);
        
        console.log(`✓ ${file} → ${file.replace(".svg", ".png")}`);
        
        // SVG 파일 삭제 (선택적)
        // fs.unlinkSync(svgPath);
      }
    }
    
    console.log("\n✨ PNG 변환 완료!");
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error("\n❌ sharp 모듈이 설치되지 않았습니다.");
      console.log("   다음 명령어로 설치하세요:");
      console.log("   npm install sharp\n");
    } else {
      console.error("변환 오류:", error);
    }
  }
}

convertSVGtoPNG();

