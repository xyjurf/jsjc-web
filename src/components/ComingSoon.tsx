import PageTransition from "@/components/PageTransition";
import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

export default function ComingSoon({
  title,
  icon: Icon,
  description,
}: ComingSoonProps) {
  return (
    <PageTransition>
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mb-5">
            <Icon className="h-10 w-10 text-accent animate-float" />
          </div>
          <p className="text-lg font-medium text-text">{description}</p>
          <p className="mt-2 text-sm text-text-muted">该功能即将上线，敬请期待</p>
        </div>
      </div>
    </PageTransition>
  );
}