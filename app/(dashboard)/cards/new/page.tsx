"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardForm, type CardFormData } from "@/components/features/cards/CardForm";

/**
 * 명함 추가 페이지
 */
export default function NewCardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CardFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        alert("✅ 명함이 저장되었습니다.");
        router.push("/cards");
      } else {
        alert("❌ " + (result.error || "명함 저장에 실패했습니다."));
      }
    } catch (error) {
      console.error("명함 저장 오류:", error);
      alert("❌ 명함 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/cards");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">명함 추가</h1>
        <p className="text-gray-600 mt-2">
          새로운 명함 정보를 입력하세요.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CardForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

