"use client";

/**
 * 오프라인 페이지
 * 인터넷 연결이 없을 때 표시되는 페이지
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6 text-center space-y-6">
          {/* 오프라인 아이콘 */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <WifiOff className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">!</span>
              </div>
            </div>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              인터넷 연결 없음
            </h1>
            <p className="text-gray-600">
              인터넷 연결을 확인하고 다시 시도해주세요.
            </p>
          </div>

          {/* 오프라인 기능 안내 */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-left">
            <p className="font-semibold text-blue-900 mb-2">
              💡 오프라인에서도 사용 가능:
            </p>
            <ul className="space-y-1 text-blue-800">
              <li>• 저장된 명함 목록 보기</li>
              <li>• 명함 정보 확인</li>
              <li>• 메모 작성 (나중에 동기화)</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Home className="h-4 w-4" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* 도움말 */}
          <div className="pt-4 border-t text-xs text-gray-500">
            <p>문제가 계속되면 다음을 확인하세요:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Wi-Fi 또는 모바일 데이터 연결</li>
              <li>• 비행기 모드 해제</li>
              <li>• 네트워크 설정 확인</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

