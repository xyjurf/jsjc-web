import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarShell from "@/components/SidebarShell";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <SidebarShell email={user.email ?? "用户"} role="admin">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </SidebarShell>
  );
}