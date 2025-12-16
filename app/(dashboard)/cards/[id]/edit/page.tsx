"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CardForm, type CardFormData } from "@/components/features/cards/CardForm";
import type { BusinessCard } from "@/types/database";

/**
 * 명함 수정 페이지
 */
export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 명함 데이터 로드
  useEffect(() => {
    const loadCard = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}`);

        if (!response.ok) {
          throw new Error("명함을 불러오는데 실패했습니다.");
        }

        const result = await response.json();

        if (result.ok && result.data) {
          setCard(result.data);
        } else {
          alert("❌ 명함을 찾을 수 없습니다.");
          router.push("/cards");
        }
      } catch (error) {
        console.error("명함 로드 오류:", error);
        alert("❌ 명함을 불러오는 중 오류가 발생했습니다.");
        router.push("/cards");
      } finally {
        setIsLoading(false);
      }
    };

    loadCard();
  }, [cardId, router]);

  const handleSubmit = async (data: CardFormData) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        alert("✅ 명함이 수정되었습니다.");
        router.push(`/cards/${cardId}`);
      } else {
        alert("❌ " + (result.error || "명함 수정에 실패했습니다."));
      }
    } catch (error) {
      console.error("명함 수정 오류:", error);
      alert("❌ 명함 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/cards/${cardId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">명함 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">명함 수정</h1>
        <p className="text-gray-600 mt-2">
          {card.name}님의 명함 정보를 수정하세요.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CardForm
          initialData={{
            name: card.name,
            company: card.company || undefined,
            title: card.title || undefined,
            phone: card.phone || undefined,
            email: card.email || undefined,
            address: card.address || undefined,
            website: undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}

