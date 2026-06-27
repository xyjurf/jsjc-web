import ComingSoon from "@/components/ComingSoon";
import { Server } from "lucide-react";

export default function NodesPage() {
  return (
    <ComingSoon
      title="我的节点"
      icon={Server}
      description="实时监控节点运行状态与延迟"
    />
  );
}