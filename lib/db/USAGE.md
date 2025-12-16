# 데이터베이스 헬퍼 함수 사용 가이드

이 문서는 프로젝트의 데이터베이스 헬퍼 함수 사용 방법을 설명합니다.

## 📚 목차

- [프로필 관리](#프로필-관리)
- [명함 관리](#명함-관리)
- [이미지 업로드](#이미지-업로드)
- [에러 처리](#에러-처리)

## 프로필 관리

### 현재 사용자 프로필 가져오기

```typescript
import { getCurrentProfile } from "@/lib/db";

export default async function ProfilePage() {
  const result = await getCurrentProfile();

  if (!result.ok) {
    return <div>에러: {result.error}</div>;
  }

  const profile = result.data;

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.email}</p>
    </div>
  );
}
```

### 프로필 업데이트

```typescript
import { updateCurrentProfile } from "@/lib/db";

async function handleUpdateProfile(formData: { name: string }) {
  const result = await updateCurrentProfile({
    name: formData.name,
  });

  if (!result.ok) {
    console.error("프로필 업데이트 실패:", result.error);
    return;
  }

  console.log("프로필 업데이트 성공:", result.data);
}
```

## 명함 관리

### 명함 목록 가져오기 (필터링 및 페이지네이션)

```typescript
import { getBusinessCards } from "@/lib/db";

export default async function CardsPage() {
  // 기본 사용
  const result = await getBusinessCards();

  // 검색 및 필터링
  const filteredResult = await getBusinessCards(
    {
      search: "홍길동", // 이름, 회사명, 직함 검색
      tags: ["거래처", "VIP"], // 태그 필터
      sortBy: "name", // 정렬 기준
      sortOrder: "asc", // 정렬 순서
    },
    1, // 페이지 번호
    20 // 페이지 크기
  );

  if (!filteredResult.ok) {
    return <div>에러: {filteredResult.error}</div>;
  }

  const { data: cards, total, hasMore } = filteredResult.data;

  return (
    <div>
      <h1>명함 목록 (총 {total}개)</h1>
      {cards.map((card) => (
        <div key={card.id}>
          <h2>{card.name}</h2>
          <p>{card.company}</p>
        </div>
      ))}
      {hasMore && <button>더 보기</button>}
    </div>
  );
}
```

### 명함 상세 정보 가져오기

```typescript
import { getBusinessCardById } from "@/lib/db";

export default async function CardDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getBusinessCardById(params.id);

  if (!result.ok) {
    return <div>에러: {result.error}</div>;
  }

  const card = result.data;

  return (
    <div>
      <h1>{card.name}</h1>
      <p>회사: {card.company}</p>
      <p>직함: {card.title}</p>
      <p>전화: {card.phone}</p>
      <p>이메일: {card.email}</p>
      <p>태그: {card.tags.join(", ")}</p>
    </div>
  );
}
```

### 명함 생성

```typescript
import { createBusinessCard } from "@/lib/db";

async function handleCreateCard(formData: {
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  tags?: string[];
}) {
  const result = await createBusinessCard({
    name: formData.name,
    company: formData.company,
    title: formData.title,
    phone: formData.phone,
    email: formData.email,
    tags: formData.tags || [],
  });

  if (!result.ok) {
    console.error("명함 생성 실패:", result.error);
    return;
  }

  console.log("명함 생성 성공:", result.data);
  // 리다이렉트 또는 상태 업데이트
}
```

### 명함 수정

```typescript
import { updateBusinessCard } from "@/lib/db";

async function handleUpdateCard(
  cardId: string,
  updates: {
    company?: string;
    title?: string;
    memo?: string;
  }
) {
  const result = await updateBusinessCard(cardId, updates);

  if (!result.ok) {
    console.error("명함 수정 실패:", result.error);
    return;
  }

  console.log("명함 수정 성공:", result.data);
}
```

### 명함 삭제

```typescript
import { deleteBusinessCard, deleteBusinessCards } from "@/lib/db";

// 단일 명함 삭제
async function handleDeleteCard(cardId: string) {
  const result = await deleteBusinessCard(cardId);

  if (!result.ok) {
    console.error("명함 삭제 실패:", result.error);
    return;
  }

  console.log("명함 삭제 성공");
}

// 여러 명함 한 번에 삭제
async function handleBulkDelete(cardIds: string[]) {
  const result = await deleteBusinessCards(cardIds);

  if (!result.ok) {
    console.error("명함 삭제 실패:", result.error);
    return;
  }

  console.log(`${cardIds.length}개의 명함 삭제 성공`);
}
```

### 태그로 명함 검색

```typescript
import { searchBusinessCardsByTag, getAllTags } from "@/lib/db";

// 특정 태그로 검색
async function searchByTag(tag: string) {
  const result = await searchBusinessCardsByTag(tag);

  if (!result.ok) {
    console.error("검색 실패:", result.error);
    return;
  }

  return result.data; // BusinessCard[]
}

// 모든 태그 목록 가져오기
async function loadTags() {
  const result = await getAllTags();

  if (!result.ok) {
    console.error("태그 로드 실패:", result.error);
    return;
  }

  return result.data; // string[]
}
```

### 명함 통계 가져오기

```typescript
import { getBusinessCardStats } from "@/lib/db";

export default async function DashboardPage() {
  const result = await getBusinessCardStats();

  if (!result.ok) {
    return <div>에러: {result.error}</div>;
  }

  const stats = result.data;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <h3>전체 명함</h3>
        <p>{stats.total}</p>
      </div>
      <div>
        <h3>이번 달 추가</h3>
        <p>{stats.thisMonth}</p>
      </div>
      <div>
        <h3>최근 수정</h3>
        <p>{stats.recentlyModified}</p>
      </div>
      <div>
        <h3>상위 태그</h3>
        <ul>
          {stats.topTags.map(({ tag, count }) => (
            <li key={tag}>
              {tag}: {count}개
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## 이미지 업로드

### 명함 이미지 업로드

```typescript
"use client";

import { uploadCardImage } from "@/lib/db";
import { useState } from "react";

export default function ImageUploadForm({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const result = await uploadCardImage(file, userId);

    setUploading(false);

    if (!result.ok) {
      alert("업로드 실패: " + result.error);
      return;
    }

    console.log("업로드된 이미지 URL:", result.data);
    // 명함에 이미지 URL 저장
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>업로드 중...</p>}
    </div>
  );
}
```

### 이미지 삭제

```typescript
import { deleteCardImage } from "@/lib/db";

async function handleDeleteImage(imageUrl: string) {
  const result = await deleteCardImage(imageUrl);

  if (!result.ok) {
    console.error("이미지 삭제 실패:", result.error);
    return;
  }

  console.log("이미지 삭제 성공");
}
```

## 에러 처리

### 기본 에러 처리 패턴

```typescript
import { getBusinessCards } from "@/lib/db";

async function loadCards() {
  const result = await getBusinessCards();

  // 에러 확인
  if (!result.ok) {
    // 에러 처리
    console.error("명함 로드 실패:", result.error);
    return null;
  }

  // 성공 처리
  return result.data;
}
```

### Server Actions에서 사용

```typescript
"use server";

import { createBusinessCard } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCardAction(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;

  const result = await createBusinessCard({
    name,
    company,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  // 성공 시 페이지 재검증
  revalidatePath("/cards");

  return { success: true, data: result.data };
}
```

### Client Components에서 사용

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function CardForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("business_cards")
        .insert({
          name: formData.get("name") as string,
          company: formData.get("company") as string,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      // 성공 처리
      console.log("명함 생성 성공:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="name" required />
      <input name="company" />
      <button type="submit" disabled={loading}>
        {loading ? "생성 중..." : "명함 생성"}
      </button>
    </form>
  );
}
```

## 🎯 모범 사례

### 1. Server Components에서는 Server 헬퍼 사용

```typescript
// ✅ 좋음: Server Component
import { getBusinessCards } from "@/lib/db"; // 서버 헬퍼 사용

export default async function CardsPage() {
  const result = await getBusinessCards();
  // ...
}
```

### 2. Client Components에서는 Client 직접 사용

```typescript
// ✅ 좋음: Client Component
"use client";

import { createClient } from "@/lib/supabase/client";

export default function CardForm() {
  const supabase = createClient();
  // ...
}
```

### 3. 항상 에러 체크

```typescript
// ✅ 좋음
const result = await getBusinessCards();
if (!result.ok) {
  // 에러 처리
  return;
}
const cards = result.data;

// ❌ 나쁨 (에러 체크 없음)
const result = await getBusinessCards();
const cards = result.data; // result.ok가 false면 undefined!
```

### 4. TypeScript 타입 활용

```typescript
import type { BusinessCardFormData } from "@/types";

// ✅ 좋음: 타입 안전성
const formData: BusinessCardFormData = {
  name: "홍길동",
  company: "테크컴퍼니",
  tags: ["거래처"],
};

const result = await createBusinessCard(formData);
```

## 📖 추가 리소스

- [Supabase JavaScript Client 문서](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js Server Actions 가이드](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TypeScript 타입 정의](../../types/database.ts)

