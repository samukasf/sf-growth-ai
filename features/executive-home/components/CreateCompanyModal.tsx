"use client";

import { useState, useTransition } from "react";

import { DsButton, DsInput, DsTextarea } from "@/components/design-system";

import {
  createPortfolioCompanyAction,
  type CreateCompanyInput,
} from "../actions/create-company.action";

const EMPTY_FORM: CreateCompanyInput = {
  companyName: "",
  segment: "",
  responsibleName: "",
  email: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
  city: "",
  country: "Portugal",
  employeeCount: "",
  mainObjective: "",
  notes: "",
};

type CreateCompanyModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function CreateCompanyModal({ open, onClose, onSaved }: CreateCompanyModalProps) {
  const [form, setForm] = useState<CreateCompanyInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const updateField = (field: keyof CreateCompanyInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createPortfolioCompanyAction(form);
        setForm(EMPTY_FORM);
        onSaved();
        onClose();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível salvar a empresa.");
      }
    });
  };

  return (
    <div
      className="ds-root ds-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-company-title"
    >
      <div className="ds-modal-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[var(--ds-border)] px-6 py-5">
            <h2 id="create-company-title" className="ds-heading">
              Nova Empresa
            </h2>
            <p className="mt-2 ds-body-sm ds-muted">
              Cadastre uma empresa para iniciar o relacionamento com sua agência.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <DsInput
              label="Nome da Empresa *"
              name="companyName"
              required
              value={form.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
            />
            <DsInput
              label="Segmento *"
              name="segment"
              required
              value={form.segment}
              onChange={(event) => updateField("segment", event.target.value)}
            />
            <DsInput
              label="Responsável"
              name="responsibleName"
              value={form.responsibleName}
              onChange={(event) => updateField("responsibleName", event.target.value)}
            />
            <DsInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <DsInput
              label="Telefone"
              name="phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
            <DsInput
              label="Website"
              name="website"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
            <DsInput
              label="Instagram"
              name="instagram"
              value={form.instagram}
              onChange={(event) => updateField("instagram", event.target.value)}
            />
            <DsInput
              label="Facebook"
              name="facebook"
              value={form.facebook}
              onChange={(event) => updateField("facebook", event.target.value)}
            />
            <DsInput
              label="Cidade"
              name="city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
            <DsInput
              label="País"
              name="country"
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
            />
            <DsInput
              label="Número de Funcionários"
              name="employeeCount"
              value={form.employeeCount}
              onChange={(event) => updateField("employeeCount", event.target.value)}
            />
            <div className="sm:col-span-2">
              <DsInput
                label="Objetivo Principal"
                name="mainObjective"
                value={form.mainObjective}
                onChange={(event) => updateField("mainObjective", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <DsTextarea
                label="Observações"
                name="notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p className="px-6 pb-2 text-sm text-[var(--ds-danger)]">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[var(--ds-border)] px-6 py-4">
            <DsButton type="button" variant="secondary" onClick={handleClose} disabled={isPending}>
              Cancelar
            </DsButton>
            <DsButton type="submit" disabled={isPending}>
              Salvar Empresa
            </DsButton>
          </div>
        </form>
      </div>
    </div>
  );
}
