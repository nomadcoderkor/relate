"use client";

/**
 * 명함 정보 입력 폼
 * OCR 결과를 자동으로 채우고 수동 수정 가능
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ParsedCardInfo } from "@/types/ocr";
import {
  User,
  Building2,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Globe,
  Tags,
  FileText,
  Sparkles,
} from "lucide-react";

interface CardFormProps {
  initialData?: Partial<ParsedCardInfo>;
  onSubmit: (data: CardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CardFormData {
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  memo?: string;
  tags?: string[];
  imageUrl?: string;
}

export function CardForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    name: initialData?.name || "",
    company: initialData?.company || "",
    title: initialData?.title || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    website: initialData?.website || "",
    memo: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const hasOCRData = initialData && Object.keys(initialData).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OCR 자동 추출 안내 */}
      {hasOCRData && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Sparkles className="h-4 w-4" />
          <span>OCR로 자동 추출된 정보입니다. 수정이 가능합니다.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="홍길동"
            required
            className={hasOCRData && initialData?.name ? "bg-blue-50" : ""}
          />
        </div>

        {/* 회사 */}
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            회사
          </Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="주식회사 ABC"
            className={hasOCRData && initialData?.company ? "bg-blue-50" : ""}
          />
        </div>

        {/* 직함 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            직함
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="대표이사"
            className={hasOCRData && initialData?.title ? "bg-blue-50" : ""}
          />
        </div>

        {/* 전화번호 */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            전화번호
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-1234-5678"
            className={
              hasOCRData && initialData?.phone
                ? "bg-blue-50"
                : ""
            }
          />
        </div>

        {/* 이메일 */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            이메일
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className={hasOCRData && initialData?.email ? "bg-blue-50" : ""}
          />
        </div>

        {/* 웹사이트 */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            웹사이트
          </Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="www.example.com"
            className={hasOCRData && initialData?.website ? "bg-blue-50" : ""}
          />
        </div>
      </div>

      {/* 주소 */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          주소
        </Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="서울특별시 강남구..."
          className={hasOCRData && initialData?.address ? "bg-blue-50" : ""}
        />
      </div>

      {/* 메모 */}
      <div className="space-y-2">
        <Label htmlFor="memo" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          메모
        </Label>
        <Textarea
          id="memo"
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          placeholder="메모 내용을 입력하세요..."
          rows={3}
        />
      </div>

      {/* 태그 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tags className="h-4 w-4" />
          태그
        </Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="태그 입력 후 Enter"
          />
          <Button type="button" onClick={addTag} variant="outline">
            추가
          </Button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}

