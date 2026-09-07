"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Card, Input } from "@/components/ui";

import {
  requestPasswordResetAction,
  signUpWithPasswordAction,
  updatePasswordAction,
  type AuthFormState,
} from "../actions/auth.actions";

const initialState: AuthFormState = {};

function FormFeedback({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
        {state.success}
      </p>
    );
  }
  return null;
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpWithPasswordAction, initialState);

  return (
    <Card className="w-full max-w-[440px]">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Criar conta</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Proteja os dados das suas empresas e o histórico do Samuel AI.
      </p>
      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <Input label="Nome" name="fullName" autoComplete="name" required />
        <Input label="E-mail" name="email" type="email" autoComplete="email" required />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FormFeedback state={state} />
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "A criar…" : "Criar conta"}
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

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-[440px]">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Redefinir senha</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Enviaremos um link seguro para o e-mail cadastrado.
      </p>
      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <Input label="E-mail" name="email" type="email" autoComplete="email" required />
        <FormFeedback state={state} />
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "A enviar…" : "Enviar link"}
        </Button>
      </form>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-zinc-400 transition hover:text-white"
      >
        Voltar ao login
      </Link>
    </Card>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <Card className="w-full max-w-[440px]">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova senha</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Defina uma senha com pelo menos oito caracteres.
      </p>
      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <Input
          label="Nova senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Confirmar senha"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FormFeedback state={state} />
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "A atualizar…" : "Atualizar senha"}
        </Button>
      </form>
    </Card>
  );
}
