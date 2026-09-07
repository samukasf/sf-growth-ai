import { AuthLoginForm } from "@/features/auth";

export const metadata = {
  title: "Entrar | SF Growth AI",
};

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const next = (await searchParams)?.next;
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthLoginForm next={next} />
    </main>
  );
}
