"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import type { BusinessCard } from "@/types/database";
import { SummarizeButton } from "@/components/features/ai/SummarizeButton";

/**
 * 명함 상세 페이지
 */
export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState("");
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
          setMemo(result.data.memo || "");
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

  // 메모 저장
  const handleSaveMemo = async () => {
    if (!card) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memo }),
      });

      const result = await response.json();

      if (result.ok) {
        alert("✅ 메모가 저장되었습니다.");
        setCard(result.data);
        setIsEditing(false);
      } else {
        alert("❌ " + (result.error || "메모 저장에 실패했습니다."));
      }
    } catch (error) {
      console.error("메모 저장 오류:", error);
      alert("❌ 메모 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 명함 삭제
  const handleDelete = async () => {
    if (!confirm("정말 이 명함을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.ok) {
        alert("✅ 명함이 삭제되었습니다.");
        router.push("/cards");
      } else {
        alert("❌ " + (result.error || "명함 삭제에 실패했습니다."));
      }
    } catch (error) {
      console.error("명함 삭제 오류:", error);
      alert("❌ 명함 삭제 중 오류가 발생했습니다.");
    }
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">명함을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/cards")} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/cards")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/cards/${cardId}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            수정
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 명함 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>명함 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 명함 이미지 */}
            {card.image_url ? (
              <div className="w-full">
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl font-bold text-indigo-600">
                  {card.name[0]}
                </span>
              </div>
            )}

            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.name}</p>
                  {card.title && (
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Briefcase className="h-4 w-4" />
                      {card.title}
                    </p>
                  )}
                </div>
              </div>

              {card.company && (
                <div className="flex items-start gap-3 pt-3 border-t">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">회사</p>
                    <p className="text-gray-900">{card.company}</p>
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <a
                      href={`tel:${card.phone}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {card.phone}
                    </a>
                  </div>
                </div>
              )}

              {card.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <a
                      href={`mailto:${card.email}`}
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {card.email}
                    </a>
                  </div>
                </div>
              )}

              {card.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">주소</p>
                    <p className="text-gray-900 whitespace-pre-line">
                      {card.address}
                    </p>
                  </div>
                </div>
              )}

              {card.last_contact_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">마지막 연락일</p>
                    <p className="text-gray-900">
                      {new Date(card.last_contact_date).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* 태그 */}
              {card.tags && card.tags.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-2">태그</p>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 메모 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                메모
              </span>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  편집
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  rows={10}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveMemo}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMemo(card.memo || "");
                      setIsEditing(false);
                    }}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                </div>
              </>
            ) : (
              <>
                {card.memo ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {card.memo}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">메모가 없습니다.</p>
                )}

                {/* AI 메모 요약 버튼 */}
                {card.memo && card.memo.length > 100 && (
                  <div className="pt-4 border-t">
                    <SummarizeButton
                      memo={card.memo}
                      onSummarized={(summary) => setMemo(summary)}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI 팔로업 메시지 생성 */}
      {card.memo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              팔로업 메시지 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/ai/generate-message", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: card.name,
                        memo: card.memo,
                        tone: "kakao",
                      }),
                    });

                    const result = await response.json();

                    if (result.ok) {
                      alert(`📱 카카오톡 메시지:\n\n${result.data.message}`);
                    } else {
                      alert("❌ " + (result.error || "메시지 생성에 실패했습니다."));
                    }
                  } catch (error) {
                    console.error("메시지 생성 오류:", error);
                    alert("❌ 메시지 생성 중 오류가 발생했습니다.");
                  }
                }}
              >
                <Sparkles className="h-4 w-4" />
                카카오톡 메시지
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/ai/generate-message", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: card.name,
                        memo: card.memo,
                        tone: "email",
                      }),
                    });

                    const result = await response.json();

                    if (result.ok) {
                      alert(`✉️ 이메일 메시지:\n\n${result.data.message}`);
                    } else {
                      alert("❌ " + (result.error || "메시지 생성에 실패했습니다."));
                    }
                  } catch (error) {
                    console.error("메시지 생성 오류:", error);
                    alert("❌ 메시지 생성 중 오류가 발생했습니다.");
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                이메일 메시지
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

