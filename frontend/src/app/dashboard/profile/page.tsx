import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <FeatureShell 
      title="User Profile" 
      subtitle="Neural Signature & Personal Health Repository" 
      icon={<User size={32} />}
    />
  );
}
