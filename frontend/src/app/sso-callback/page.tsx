import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-text-secondary font-medium animate-pulse">Authenticating...</p>
      <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/profile-setup" signInForceRedirectUrl="/dashboard" />
    </div>
  );
}
