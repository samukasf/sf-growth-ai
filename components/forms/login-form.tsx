import { Button, Card, Input } from "@/components/ui";

export function LoginForm() {
  return (
    <Card className="w-full max-w-[420px]">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Entrar
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Acesse sua conta para continuar crescendo.
        </p>
      </div>

      <form className="flex flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button type="submit" fullWidth className="mt-1">
          Entrar
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-5">
        <button
          type="button"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Esqueceu sua senha?
        </button>

        <Button type="button" variant="secondary" fullWidth>
          Começar Diagnóstico
        </Button>
      </div>
    </Card>
  );
}
