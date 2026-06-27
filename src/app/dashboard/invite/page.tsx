import ComingSoon from "@/components/ComingSoon";
import { Gift } from "lucide-react";

export default function InvitePage() {
  return (
    <ComingSoon
      title="我的邀请"
      icon={Gift}
      description="邀请好友注册，双方均可获得奖励"
    />
  );
}