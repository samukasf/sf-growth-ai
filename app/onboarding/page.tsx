import { OnboardingForm } from "@/features/onboarding";

export const metadata = {
  title: "Onboarding | SF Growth AI",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <OnboardingForm />
    </main>
  );
}
