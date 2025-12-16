"use client";

/**
 * 메모 요약 버튼 컴포넌트
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check } from "lucide-react";
import type { SummarizeResponse, AIApiResponse } from "@/types/ai";

interface SummarizeButtonProps {
  memo: string;
  onSummarized: (summary: string) => void;
  disabled?: boolean;
}

export function SummarizeButton({
  memo,
  onSummarized,
  disabled = false,
}: SummarizeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSummarize = async () => {
    if (!memo || memo.length < 50) {
      setError("메모가 너무 짧습니다. (최소 50자 필요)");
      return;
    }

    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memo }),
      });

      if (!response.ok) {
        throw new Error("요약 생성에 실패했습니다.");
      }

      const result: AIApiResponse<SummarizeResponse> = await response.json();

      if (!result.ok || !result.data) {
        throw new Error(result.error || "요약 생성에 실패했습니다.");
      }

      onSummarized(result.data.summary);
      setIsSuccess(true);

      // 2초 후 성공 상태 초기화
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.error("Summarize error:", err);
      setError(
        err instanceof Error ? err.message : "요약 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSummarize}
        disabled={disabled || isLoading || !memo || memo.length < 50}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            요약 중...
          </>
        ) : isSuccess ? (
          <>
            <Check className="h-4 w-4" />
            요약 완료
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            AI로 요약하기
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {memo && memo.length < 50 && !error && (
        <p className="text-xs text-gray-500">
          메모가 너무 짧습니다. (현재: {memo.length}자 / 최소: 50자)
        </p>
      )}
    </div>
  );
}

