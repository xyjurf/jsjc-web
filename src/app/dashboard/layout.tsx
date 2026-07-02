import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarShell from "@/components/SidebarShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <SidebarShell email={user.email ?? "用户"} role={profile?.role ?? null}>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </SidebarShell>
  );
}