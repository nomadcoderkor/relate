"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { useState } from "react";

const navigation = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "명함 목록",
    href: "/cards",
    icon: CreditCard,
  },
  {
    name: "프로필",
    href: "/profile",
    icon: User,
  },
];

export function DashboardNav({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
  }

  return (
    <>
      {/* 데스크톱 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 로고 및 메뉴 */}
            <div className="flex">
              {/* 로고 */}
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-900 hover:text-gray-700"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">명함관리</span>
              </Link>

              {/* 데스크톱 메뉴 */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 우측 메뉴 */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {/* 사용자 정보 */}
              {userName && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{userName}</span>님
                </div>
              )}

              {/* 로그아웃 버튼 */}
              <form action={handleLogout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </form>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-base font-medium rounded-lg",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* 모바일 로그아웃 */}
              <form action={handleLogout}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50 px-4 py-3"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  로그아웃
                </Button>
              </form>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

