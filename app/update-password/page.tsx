import { UpdatePasswordForm } from "@/features/auth";

export const metadata = { title: "Nova senha | SF Growth AI" };

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <UpdatePasswordForm />
    </main>
  );
}
