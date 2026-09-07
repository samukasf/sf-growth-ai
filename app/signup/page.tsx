import { SignUpForm } from "@/features/auth";

export const metadata = { title: "Criar conta | SF Growth AI" };

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignUpForm />
    </main>
  );
}
