/**
 * OCR 텍스트 파싱 로직
 * 명함에서 이름, 회사, 직함, 연락처 등을 추출
 */

import type { ParsedCardInfo } from "@/types/ocr";

/**
 * 정규식 패턴
 */
const PATTERNS = {
  // 이메일: standard@example.com
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // 전화번호: 010-1234-5678, 02-123-4567, +82-10-1234-5678, +82.10.6430.0932, +82. 106430.0932
  // 구분자: 하이픈(-), 점(.), 공백( ) 모두 지원 (0개 이상)
  mobile: /(?:\+82[-.\s]*)?0?10[-.\s]*\d{3,4}[-.\s]*\d{4}/g,
  phone: /0\d{1,2}[-.\s]*\d{3,4}[-.\s]*\d{4}/g,

  // 팩스
  fax: /fax[\s:]*0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}/gi,

  // 웹사이트: www.example.com, http://example.com
  website: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g,

  // 한국 주소 (도/시로 시작)
  address: /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:특별시|광역시|특별자치시|도|특별자치도)?[\s\S]{5,}/,
};

/**
 * 회사명 키워드
 */
const COMPANY_KEYWORDS = [
  "주식회사",
  "(주)",
  "㈜",
  "I주I", // OCR 오인식 대응
  "|주|", // OCR 오인식 대응 (세로 막대)
  "유한회사",
  "(유)",
  "Co.,Ltd",
  "Co., Ltd.",
  "Corporation",
  "Corp.",
  "Inc.",
  "LLC",
  "Ltd.",
  "Group",
  "컴퍼니",
  "기업",
  "회사",
];

/**
 * 직함 키워드
 */
const TITLE_KEYWORDS = [
  "대표이사",
  "대표",
  "회장",
  "부회장",
  "사장",
  "부사장",
  "전무",
  "상무",
  "이사",
  "부장",
  "차장",
  "과장",
  "대리",
  "주임",
  "사원",
  "팀장",
  "실장",
  "본부장",
  "센터장",
  "소장",
  "원장",
  "CEO",
  "CTO",
  "CFO",
  "COO",
  "CIO",
  "Director",
  "Manager",
  "Engineer",
  "Developer",
  "Designer",
  "Consultant",
];

/**
 * 부서 키워드
 */
const DEPARTMENT_KEYWORDS = [
  "경영",
  "기획",
  "개발",
  "연구",
  "마케팅",
  "영업",
  "총무",
  "인사",
  "재무",
  "회계",
  "IT",
  "디자인",
  "Team",
  "Dept",
  "Division",
];

/**
 * Google Vision OCR 결과 파싱 (텍스트 문자열)
 */
export function parseOcrResult(fullText: string): ParsedCardInfo {
  // 줄바꿈으로 분리
  const lines = fullText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // 디버깅: OCR 텍스트 로깅
  console.log("OCR Full Text:", fullText);
  console.log("OCR Lines:", lines);

  // 각 필드 추출
  const name = extractName(lines, fullText);
  const company = extractCompany(lines, fullText, name);
  const title = extractTitle(lines, fullText);
  const email = extractEmail(fullText);
  const phones = extractPhones(fullText);
  const website = extractWebsite(fullText);
  const address = extractAddress(fullText);

  // 디버깅: 추출 결과 로깅
  console.log("Parsed Results:", {
    name,
    company,
    title,
    phone: phones.phone || phones.mobile,
    email,
    website,
    address,
  });

  // 추출된 필드 카운트
  const detectedFields: string[] = [];
  if (name) detectedFields.push("name");
  if (company) detectedFields.push("company");
  if (title) detectedFields.push("title");
  if (phones.phone || phones.mobile) detectedFields.push("phone");
  if (email) detectedFields.push("email");
  if (address) detectedFields.push("address");
  if (website) detectedFields.push("website");

  const parsedInfo: ParsedCardInfo = {
    name,
    company,
    title,
    phone: phones.phone || phones.mobile,
    email,
    address,
    website,
    detectedFields,
    confidence: calculateConfidence({ name, company, title, phone: phones.phone || phones.mobile, email }),
  };

  return parsedInfo;
}

/**
 * 이름 추출 (한글 2-4자 or 영문 이름)
 */
function extractName(lines: string[], allText: string): string | undefined {
  // 첫 번째 줄에서 이름 찾기 (보통 명함 상단에 크게 표시됨)
  for (const line of lines.slice(0, 3)) {
    // 한글 이름 (2-4자)
    const koreanName = line.match(/[가-힣]{2,4}(?=\s|$)/);
    if (koreanName && !TITLE_KEYWORDS.includes(koreanName[0])) {
      return koreanName[0];
    }

    // 영문 이름
    const englishName = line.match(/[A-Z][a-z]+\s[A-Z][a-z]+/);
    if (englishName) {
      return englishName[0];
    }
  }

  return undefined;
}

/**
 * 회사명 추출
 */
function extractCompany(lines: string[], allText: string, extractedName?: string): string | undefined {
  for (const line of lines) {
    // 추출된 이름과 같은 라인은 제외
    if (extractedName && line.includes(extractedName) && line.length <= extractedName.length + 5) {
      continue;
    }
    
    // 회사 키워드가 포함된 라인 찾기
    for (const keyword of COMPANY_KEYWORDS) {
      if (line.includes(keyword)) {
        // 키워드 이전 텍스트 + 키워드 + 키워드 이후 텍스트 결합
        // 예: "(주)디엠판센트" 또는 "I주I디엠판센트" 또는 "|주| 더일퍼센트"
        const companyMatch = line.match(
          new RegExp(`([가-힣a-zA-Z0-9()㈜|\\s]*${keyword.replace(/[()|\[\]]/g, "\\$&")}[가-힣a-zA-Z0-9\\s]*)`)
        );
        if (companyMatch) {
          // OCR 오인식 정규화: "I주I" → "(주)", "|주|" → "(주)"
          let company = companyMatch[1].trim();
          company = company.replace(/I주I/g, "(주)");
          company = company.replace(/\|주\|/g, "(주)");
          return company;
        }
        // 전체 라인 반환
        let company = line.trim();
        company = company.replace(/I주I/g, "(주)");
        company = company.replace(/\|주\|/g, "(주)");
        return company;
      }
    }
    
    // 회사명으로 보이는 패턴 (한글 3자 이상 + 특수문자)
    const companyPattern = line.match(/[가-힣]{3,}(?:주식회사|㈜|\(주\)|회사|기업|그룹|컴퍼니)?/);
    if (companyPattern && !TITLE_KEYWORDS.some(keyword => line.includes(keyword))) {
      // 이름과 다른 경우만 반환
      if (extractedName && companyPattern[0].includes(extractedName)) {
        continue;
      }
      return companyPattern[0].trim();
    }
  }

  return undefined;
}

/**
 * 직함 추출
 */
function extractTitle(lines: string[], allText: string): string | undefined {
  for (const line of lines) {
    for (const keyword of TITLE_KEYWORDS) {
      if (line.includes(keyword)) {
        // 직함만 추출 또는 부서 + 직함
        const titleMatch = line.match(
          new RegExp(`([가-힣a-zA-Z\\s]*${keyword})`)
        );
        if (titleMatch) {
          return titleMatch[1].trim();
        }
        return keyword;
      }
    }
  }

  return undefined;
}

/**
 * 부서 추출
 */
function extractDepartment(
  lines: string[],
  allText: string
): string | undefined {
  for (const line of lines) {
    for (const keyword of DEPARTMENT_KEYWORDS) {
      if (line.includes(keyword)) {
        return line.trim();
      }
    }
  }

  return undefined;
}

/**
 * 이메일 추출
 */
function extractEmail(allText: string): string | undefined {
  const emails = allText.match(PATTERNS.email);
  return emails?.[0];
}

/**
 * 전화번호 추출
 */
function extractPhones(allText: string): {
  mobile?: string;
  phone?: string;
  fax?: string;
} {
  const result: { mobile?: string; phone?: string; fax?: string } = {};

  // 팩스
  const faxMatch = allText.match(PATTERNS.fax);
  if (faxMatch) {
    result.fax = faxMatch[0].replace(/fax[\s:]*/gi, "").trim();
  }

  // 휴대폰
  const mobiles = allText.match(PATTERNS.mobile);
  if (mobiles && mobiles.length > 0) {
    // 점(.), 하이픈(-), 공백( ) 제거 후 정규화
    const cleaned = mobiles[0].replace(/[-.\s]/g, "");
    // +82로 시작하면 0 추가
    if (cleaned.startsWith("+82")) {
      result.mobile = cleaned.replace("+82", "0");
    } else {
      result.mobile = cleaned;
    }
  }

  // 일반 전화
  const phones = allText.match(PATTERNS.phone);
  if (phones && phones.length > 0) {
    // 팩스가 아닌 것만 선택
    for (const phone of phones) {
      if (!result.fax || !result.fax.includes(phone)) {
        // 점(.), 하이픈(-), 공백( ) 제거
        result.phone = phone.replace(/[-.\s]/g, "");
        break;
      }
    }
  }

  return result;
}

/**
 * 웹사이트 추출
 */
function extractWebsite(allText: string): string | undefined {
  const websites = allText.match(PATTERNS.website);
  return websites?.[0];
}

/**
 * 주소 추출
 */
function extractAddress(allText: string): string | undefined {
  const addressMatch = allText.match(PATTERNS.address);
  return addressMatch?.[0]?.trim();
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(parsedInfo: Partial<ParsedCardInfo>): number {
  let score = 0;
  let count = 0;

  if (parsedInfo.name) {
    score += 0.8;
    count++;
  }
  if (parsedInfo.company) {
    score += 0.85;
    count++;
  }
  if (parsedInfo.title) {
    score += 0.75;
    count++;
  }
  if (parsedInfo.phone) {
    score += 0.9;
    count++;
  }
  if (parsedInfo.email) {
    score += 0.95;
    count++;
  }

  return count > 0 ? score / count : 0;
}

