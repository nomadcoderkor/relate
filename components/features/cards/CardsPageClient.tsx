"use client";

/**
 * 명함 페이지 클라이언트 부분
 * 스캔 모달 및 명함 추가 기능
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardScanModal } from "./CardScanModal";
import { Plus, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CardFormData } from "./CardForm";

export function CardsPageClient() {
  const [showScanModal, setShowScanModal] = useState(false);
  const router = useRouter();

  const handleSave = async (data: CardFormData & { imageUrl?: string }) => {
    try {
      // Server Action 호출 대신 API 라우트 사용
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "명함 저장에 실패했습니다.");
      }

      // 성공 시 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setShowScanModal(true)}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Camera className="h-4 w-4" />
          명함 스캔
        </Button>
        <Button
          onClick={() => router.push("/cards/new")}
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          수동 입력
        </Button>
      </div>

      <CardScanModal
        open={showScanModal}
        onOpenChange={setShowScanModal}
        onSave={handleSave}
      />
    </>
  );
}

