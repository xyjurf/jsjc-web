"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, ChevronDown, LogOut, User, Bell } from "lucide-react";

interface TopbarProps {
  email?: string;
  onMenuClick: () => void;
}

export default function Topbar({ email = "用户", onMenuClick }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-elevated/60 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* 移动端汉堡菜单 */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-bg-card hover:text-text lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="hidden text-sm font-medium text-text-muted sm:block">
          控制台
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* 通知铃铛 */}
        <button className="relative rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-bg-card hover:text-text">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
        </button>

        {/* 用户下拉 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-bg-card"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden max-w-[120px] truncate text-text sm:inline">
              {email}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-text-muted transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* 下拉菜单 */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 animate-slide-in-down overflow-hidden rounded-xl border border-border bg-bg-card shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs text-text-muted truncate">{email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors duration-150 hover:bg-bg-elevated hover:text-text"
                >
                  <User className="h-4 w-4" />
                  个人中心
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}