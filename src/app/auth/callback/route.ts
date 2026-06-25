import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase email verification callback handler.
 * 用户点击验证邮件中的链接后，Supabase 会将用户重定向到此路由，
 * 并附带 `code` 查询参数。此路由将 code 交换为 session 并设置 cookie。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 如果 Supabase 传递了 `next` 参数（即 emailRedirectTo 指定的路径），
  // 则验证成功后重定向到该路径，否则默认跳转到 dashboard
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 验证成功，重定向到目标页面
      return NextResponse.redirect(`${origin}${next}`);
    }

    // exchangeCodeForSession 失败 — 可能是 code 已过期或无效
    // 重定向到注册页并附带错误信息
    return NextResponse.redirect(
      `${origin}/register?error=验证链接已过期或无效，请重新注册`
    );
  }

  // 没有 code 参数 — 直接重定向到注册页
  return NextResponse.redirect(`${origin}/register?error=无效的验证链接`);
}