"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

import { DsButton, DsCard, DsTextarea } from "@/components/design-system";
import { cn } from "@/utils/cn";
import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

import {
  deferFirstConversationAction,
  saveFirstConversationStepAction,
  type FirstConversationAnswers,
} from "../actions/first-conversation.action";

export const CONVERSATION_STEPS = [
  {
    key: "main_service" as const,
    question: "Qual é o principal serviço da sua empresa?",
  },
  {
    key: "ideal_client" as const,
    question: "Quem é seu cliente ideal?",
  },
  {
    key: "main_challenge" as const,
    question: "Qual é o maior desafio da empresa hoje?",
  },
  {
    key: "expectations" as const,
    question: "O que você espera que eu faça por você?",
  },
] as const;

type FirstConversationIntroProps = {
  companyId: string;
  onDeferred: (company: PortfolioCompanyRecord) => void;
};

export function FirstConversationIntro({ companyId, onDeferred }: FirstConversationIntroProps) {
  const [isPending, startTransition] = useTransition();

  const handleLater = () => {
    startTransition(async () => {
      const company = await deferFirstConversationAction(companyId);
      onDeferred(company);
    });
  };

  return (
    <DsCard padding="lg" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[var(--ds-primary)]/5"
      />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]">
            <Sparkles size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="ds-title text-[var(--ds-text)]">Olá, Samuel.</h2>
            <div className="mt-4 space-y-3 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
              <p>Sou o Company Brain da sua empresa.</p>
              <p>Ainda conheço pouco sobre seu negócio.</p>
              <p>Quanto mais eu aprender, melhores serão minhas recomendações.</p>
              <p className="font-medium text-[var(--ds-text)]">
                Gostaria de começar uma breve conversa?
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/empresas/${companyId}/conversa`}>
            <DsButton size="lg">Vamos começar</DsButton>
          </Link>
          <DsButton variant="secondary" size="lg" onClick={handleLater} disabled={isPending}>
            Mais tarde
          </DsButton>
        </div>
      </div>
    </DsCard>
  );
}

type FirstConversationDeferredProps = {
  companyId: string;
};

export function FirstConversationDeferred({ companyId }: FirstConversationDeferredProps) {
  return (
    <DsCard padding="md" className="border-dashed">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-[var(--ds-primary)]" strokeWidth={1.75} />
          <p className="text-sm text-[var(--ds-text-muted)]">
            Samuel aguarda uma breve conversa para conhecer melhor sua empresa.
          </p>
        </div>
        <Link href={`/empresas/${companyId}/conversa`}>
          <DsButton variant="secondary">Iniciar conversa</DsButton>
        </Link>
      </div>
    </DsCard>
  );
}

function getInitialStepIndex(answers: FirstConversationAnswers): number {
  for (let index = 0; index < CONVERSATION_STEPS.length; index += 1) {
    const key = CONVERSATION_STEPS[index].key;
    if (!answers[key]?.trim()) {
      return index;
    }
  }
  return CONVERSATION_STEPS.length;
}

type FirstConversationFlowProps = {
  company: PortfolioCompanyRecord;
};

export function FirstConversationFlow({ company }: FirstConversationFlowProps) {
  const existingAnswers = (company.first_conversation_answers ?? {}) as FirstConversationAnswers;
  const initialStep = getInitialStepIndex(existingAnswers);

  const [stepIndex, setStepIndex] = useState(initialStep);
  const [answers, setAnswers] = useState<FirstConversationAnswers>(existingAnswers);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isComplete = stepIndex >= CONVERSATION_STEPS.length;
  const currentStep = CONVERSATION_STEPS[stepIndex];

  const handleContinue = () => {
    if (!currentStep) return;

    const value = answers[currentStep.key]?.trim() ?? "";
    if (!value) {
      setError("Por favor, responda antes de continuar.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const updated = await saveFirstConversationStepAction(company.id, {
          [currentStep.key]: value,
        });
        setAnswers((updated.first_conversation_answers ?? {}) as FirstConversationAnswers);

        if (stepIndex === CONVERSATION_STEPS.length - 1) {
          setStepIndex(CONVERSATION_STEPS.length);
          return;
        }

        setStepIndex(stepIndex + 1);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível salvar a resposta.");
      }
    });
  };

  if (isComplete || company.first_conversation_status === "completed") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href={`/empresas/${company.id}`}
          className="w-fit text-sm text-[var(--ds-primary)] hover:underline"
        >
          ← Voltar ao dashboard
        </Link>
        <DsCard padding="lg" className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--ds-success)]/10 text-[var(--ds-success)]">
            <Sparkles size={26} strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 ds-title text-[var(--ds-text)]">Obrigado.</h1>
          <div className="mx-auto mt-4 max-w-md space-y-3 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
            <p>Já conheço um pouco melhor sua empresa.</p>
            <p>Agora posso começar a ajudá-lo de forma mais inteligente.</p>
          </div>
          <div className="mt-8">
            <Link href={`/empresas/${company.id}`}>
              <DsButton>Voltar ao dashboard</DsButton>
            </Link>
          </div>
        </DsCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href={`/empresas/${company.id}`}
        className="w-fit text-sm text-[var(--ds-primary)] hover:underline"
      >
        ← Voltar ao dashboard
      </Link>

      <div>
        <p className="ds-caption text-[var(--ds-primary)]">Primeira conversa · {company.name}</p>
        <h1 className="mt-2 ds-title text-[var(--ds-text)]">Samuel</h1>
      </div>

      <div className="flex gap-2">
        {CONVERSATION_STEPS.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index <= stepIndex
                ? "bg-[var(--ds-primary)]"
                : "bg-[var(--ds-border)]",
            )}
          />
        ))}
      </div>

      <DsCard padding="lg">
        <p className="ds-caption">
          Pergunta {stepIndex + 1} de {CONVERSATION_STEPS.length}
        </p>
        <h2 className="mt-3 ds-heading leading-snug text-[var(--ds-text)]">
          {currentStep.question}
        </h2>
        <div className="mt-6">
          <DsTextarea
            value={answers[currentStep.key] ?? ""}
            onChange={(event) => {
              setAnswers((prev) => ({ ...prev, [currentStep.key]: event.target.value }));
              if (error) setError(null);
            }}
            placeholder="Escreva sua resposta..."
            rows={4}
            disabled={isPending}
          />
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--ds-danger)]">{error}</p> : null}
        <div className="mt-6 flex justify-end">
          <DsButton onClick={handleContinue} disabled={isPending}>
            {stepIndex === CONVERSATION_STEPS.length - 1 ? "Concluir" : "Continuar"}
          </DsButton>
        </div>
      </DsCard>
    </div>
  );
}
