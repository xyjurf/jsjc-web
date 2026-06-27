"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const pwStrength = (() => {
    const len = password.length;
    if (len === 0) return 0;
    if (len < 6) return 1;
    if (len < 10) return 2;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 4;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) return 3;
    return 2;
  })();

  const strengthLabel = ["", "太短", "弱", "中等", "强"][pwStrength];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-yellow-400",
    "bg-accent",
    "bg-green-400",
  ][pwStrength];

  const pwMatch = password && confirmPassword && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setInfo("注册成功，请检查邮箱完成验证后登录。");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-scale-in relative">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
            极速机场
          </h1>
          <p className="mt-2 text-sm text-text-muted">创建新账户</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-accent">
          <h2 className="mb-6 text-center text-lg font-semibold text-text">
            注册
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                密码（至少 6 位）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 transition-colors duration-300 ${
                          level <= pwStrength
                            ? strengthColor
                            : "bg-bg-elevated"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    密码强度：{strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  placeholder="再次输入密码"
                />
                {pwMatch && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400 animate-scale-in" />
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
                {error}
              </p>
            )}

            {/* Success */}
            {info && (
              <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent animate-fade-in">
                {info}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  注册中...
                </span>
              ) : (
                "注册"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            已有账户？{" "}
            <Link
              href="/login"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}