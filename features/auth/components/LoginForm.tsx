"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Card, Input } from "@/components/ui";

import { signInWithPasswordAction, type AuthFormState } from "../actions/auth.actions";

const initialState: AuthFormState = {};

export function AuthLoginForm() {
  const [state, formAction, pending] = useActionState(signInWithPasswordAction, initialState);

  return (
    <Card className="w-full max-w-[420px]">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Entrar</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Acesse sua conta para continuar com o Samuel AI.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          required
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {state.error ? (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" fullWidth className="mt-1" disabled={pending}>
          {pending ? "A entrar…" : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-4 text-sm">
        <Link href="/onboarding" className="text-zinc-400 transition hover:text-zinc-200">
          Criar conta e configurar empresa
        </Link>
        <Link href="/samuel-ai" className="text-zinc-500 transition hover:text-zinc-300">
          Continuar sem autenticação
        </Link>
      </div>
    </Card>
  );
}
