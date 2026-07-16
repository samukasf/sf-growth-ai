import { AuthLoginForm } from "@/features/auth";

export const metadata = {
  title: "Entrar | SF Growth AI",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthLoginForm />
    </main>
  );
}
