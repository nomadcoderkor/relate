"use client";

/**
 * 명함 스캔 모달
 * 이미지 업로드 → OCR 처리 → 정보 추출 → 폼 입력
 */

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardForm, type CardFormData } from "./CardForm";
import type { ParsedCardInfo, OcrResult, UploadResult } from "@/types/ocr";
import {
  Camera,
  Upload,
  FileImage,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

interface CardScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CardFormData & { imageUrl?: string }) => Promise<void>;
}

type ScanStep = "upload" | "processing" | "form";

export function CardScanModal({
  open,
  onOpenChange,
  onSave,
}: CardScanModalProps) {
  const [step, setStep] = useState<ScanStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [ocrData, setOcrData] = useState<ParsedCardInfo | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError("");

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 파일 입력 변경
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 이미지 업로드 및 OCR 처리
  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setStep("processing");

    try {
      // 1. 이미지 업로드
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const uploadResult: { ok: boolean; data: UploadResult } =
        await uploadResponse.json();

      if (!uploadResult.ok || !uploadResult.data.imageUrl) {
        throw new Error(uploadResult.data.error || "업로드 실패");
      }

      setUploadedImageUrl(uploadResult.data.imageUrl);

      // 2. OCR 처리
      const ocrFormData = new FormData();
      ocrFormData.append("file", selectedFile);

      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        body: ocrFormData,
      });

      if (!ocrResponse.ok) {
        throw new Error("OCR 처리에 실패했습니다.");
      }

      const ocrResult: { ok: boolean; data: OcrResult } =
        await ocrResponse.json();

      if (!ocrResult.ok || !ocrResult.data.success) {
        throw new Error(ocrResult.data.error || "OCR 처리 실패");
      }

      setOcrData(ocrResult.data.parsedInfo || null);
      setStep("form");
    } catch (err) {
      console.error("Processing error:", err);
      setError(
        err instanceof Error ? err.message : "처리 중 오류가 발생했습니다."
      );
      setStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  // 폼 제출
  const handleFormSubmit = async (formData: CardFormData) => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        imageUrl: uploadedImageUrl,
      });

      // 성공 시 모달 닫기 및 초기화
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(
        err instanceof Error ? err.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 모달 닫기 및 초기화
  const handleClose = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadedImageUrl("");
    setOcrData(null);
    setError("");
    setIsProcessing(false);
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>명함 스캔</DialogTitle>
          <DialogDescription>
            명함 사진을 업로드하면 자동으로 정보를 추출합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 업로드 단계 */}
        {step === "upload" && (
          <div className="space-y-4">
            {/* 파일 선택 버튼 */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-32 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-8 w-8" />
                <span>카메라로 촬영</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-32 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8" />
                <span>갤러리에서 선택</span>
              </Button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 미리보기 */}
            {previewUrl && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={previewUrl}
                    alt="명함 미리보기"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="flex-1"
                  >
                    다시 선택
                  </Button>
                  <Button onClick={processImage} className="flex-1">
                    <FileImage className="mr-2 h-4 w-4" />
                    OCR 처리
                  </Button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* 처리 중 단계 */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">명함 정보 추출 중...</h3>
              <p className="text-sm text-gray-600">
                이미지를 분석하고 있습니다. 잠시만 기다려주세요.
              </p>
            </div>
          </div>
        )}

        {/* 폼 입력 단계 */}
        {step === "form" && (
          <div className="space-y-4">
            {/* 성공 메시지 */}
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                명함 정보를 추출했습니다.{" "}
                {ocrData?.detectedFields?.length || 0}개 필드를 찾았습니다.
              </span>
            </div>

            {/* 미리보기 이미지 */}
            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={previewUrl}
                  alt="명함"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* 폼 */}
            <CardForm
              initialData={ocrData || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
              isLoading={isSaving}
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

