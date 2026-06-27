import ComingSoon from "@/components/ComingSoon";
import { MessageSquare } from "lucide-react";

export default function TicketsPage() {
  return (
    <ComingSoon
      title="我的工单"
      icon={MessageSquare}
      description="在线提交工单，快速解决问题"
    />
  );
}