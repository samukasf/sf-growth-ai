"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Card, Input } from "@/components/ui";

import {
  completeOnboardingAction,
  type OnboardingFormState,
} from "../actions/onboarding.actions";

const initialState: OnboardingFormState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboardingAction, initialState);

  return (
    <Card className="w-full max-w-[520px]">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Configurar empresa
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Crie a empresa operacional do Samuel AI e, se quiser, a sua conta.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input label="Nome da empresa" name="companyName" required placeholder="Acme Growth" />
        <Input label="Segmento" name="industry" required placeholder="SaaS B2B" />
        <Input label="Website" name="website" placeholder="https://" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Cidade" name="city" placeholder="São Paulo" />
          <Input label="País" name="country" placeholder="Brasil" />
        </div>

        <div className="my-2 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Conta (opcional)
          </p>
          <div className="flex flex-col gap-4">
            <Input label="Seu nome" name="fullName" placeholder="Samuel Founder" />
            <Input label="Email" name="email" type="email" placeholder="voce@empresa.com" />
            <Input label="Senha" name="password" type="password" placeholder="mín. 8 caracteres" />
          </div>
        </div>

        {state.error ? (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "A configurar…" : "Ativar Samuel AI"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-zinc-300 transition hover:text-white">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
