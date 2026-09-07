import { ForgotPasswordForm } from "@/features/auth";

export const metadata = { title: "Redefinir senha | SF Growth AI" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <ForgotPasswordForm />
    </main>
  );
}
