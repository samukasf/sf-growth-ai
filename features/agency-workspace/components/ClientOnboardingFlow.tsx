"use client";

import { useCallback, useState, useTransition } from "react";

import { cn } from "@/utils/cn";

import { saveClientAction } from "../actions/save-client.action";
import type { NewClientFormInput, SaveClientResult } from "../types/new-client.types";
import { Panel } from "./shared";

const EMPTY_FORM: NewClientFormInput = {
  companyName: "",
  responsibleName: "",
  email: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
  googleBusiness: "",
  city: "",
  country: "Portugal",
  segment: "",
  employeeCount: "",
  mainObjective: "",
  notes: "",
};

const FORM_FIELDS: Array<{
  field: keyof NewClientFormInput;
  label: string;
  required?: boolean;
  type?: "textarea";
}> = [
  { field: "companyName", label: "Nome da Empresa", required: true },
  { field: "responsibleName", label: "Nome do Responsável", required: true },
  { field: "email", label: "Email" },
  { field: "phone", label: "Telefone" },
  { field: "website", label: "Website" },
  { field: "instagram", label: "Instagram" },
  { field: "facebook", label: "Facebook" },
  { field: "googleBusiness", label: "Google Business" },
  { field: "city", label: "Cidade" },
  { field: "country", label: "País" },
  { field: "segment", label: "Segmento" },
  { field: "employeeCount", label: "Número de Funcionários" },
  { field: "mainObjective", label: "Objetivo Principal" },
  { field: "notes", label: "Observações", type: "textarea" },
];

type ClientOnboardingFlowProps = {
  organizationId: string;
  agencyId: string;
  onSave: (result: SaveClientResult) => void;
  onCancel: () => void;
};

export function ClientOnboardingFlow({
  organizationId,
  agencyId,
  onSave,
  onCancel,
}: ClientOnboardingFlowProps) {
  const [form, setForm] = useState<NewClientFormInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = useCallback((field: keyof NewClientFormInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.companyName.trim() || !form.responsibleName.trim()) {
      setError("Nome da empresa e nome do responsável são obrigatórios.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveClientAction(form, { organizationId, agencyId });
        onSave(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível salvar o cliente.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Panel title="Novo Cliente" subtitle="Story 001.1 · Cadastro inicial">
        <div className="grid gap-3 sm:grid-cols-2">
          {FORM_FIELDS.map(({ field, label, required, type }) => (
            <label
              key={field}
              className={cn("flex flex-col gap-1", type === "textarea" && "sm:col-span-2")}
            >
              <span className="text-xs text-muted">
                {label}
                {required ? " *" : ""}
              </span>
              {type === "textarea" ? (
                <textarea
                  rows={4}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
                />
              ) : (
                <input
                  required={required}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
                />
              )}
            </label>
          ))}
        </div>
        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </Panel>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
            isPending && "opacity-70",
          )}
        >
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}
