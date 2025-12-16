"use client";

/**
 * 팔로업 제안 컴포넌트
 * 연락이 필요한 명함 목록 표시
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Loader2,
  AlertCircle,
  Clock,
  Building2,
  Briefcase,
  Mail,
  MessageCircle,
} from "lucide-react";
import type { FollowupSuggestion, SuggestFollowupResponse, AIApiResponse } from "@/types/ai";
import Link from "next/link";

export function FollowupSuggestionCard() {
  const [suggestions, setSuggestions] = useState<FollowupSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/suggest-followup");

      if (!response.ok) {
        throw new Error("연락 추천을 불러오는데 실패했습니다.");
      }

      const result: AIApiResponse<SuggestFollowupResponse> =
        await response.json();

      if (!result.ok || !result.data) {
        throw new Error(result.error || "연락 추천을 불러오는데 실패했습니다.");
      }

      setSuggestions(result.data.suggestions);
    } catch (err) {
      console.error("Load suggestions error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "연락 추천을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "긴급";
      case "medium":
        return "보통";
      case "low":
        return "여유";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">AI가 분석 중입니다...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-start gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSuggestions}
                className="mt-2"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            이번 주 연락 추천
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>연락이 필요한 명함이 없습니다.</p>
            <p className="text-sm mt-1">모든 관계를 잘 유지하고 계시네요! 👍</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            이번 주 연락 추천
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadSuggestions}>
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.cardId} className="border-l-4">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* 이름 및 회사 */}
                    <div>
                      <Link
                        href={`/cards/${suggestion.cardId}`}
                        className="font-semibold text-lg hover:text-indigo-600 transition-colors"
                      >
                        {suggestion.cardName}
                      </Link>
                      {suggestion.company && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {suggestion.company}
                        </p>
                      )}
                      {suggestion.title && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {suggestion.title}
                        </p>
                      )}
                    </div>

                    {/* 마지막 연락일 */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {suggestion.daysSinceContact}일 전 마지막 연락
                      </span>
                    </div>

                    {/* AI 분석 이유 */}
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      💡 {suggestion.reason}
                    </p>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/cards/${suggestion.cardId}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <MessageCircle className="h-3 w-3" />
                          메시지 작성
                        </Button>
                      </Link>
                      <Link href={`/cards/${suggestion.cardId}`}>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Mail className="h-3 w-3" />
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 우선순위 배지 */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      suggestion.priority
                    )}`}
                  >
                    {getPriorityLabel(suggestion.priority)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

