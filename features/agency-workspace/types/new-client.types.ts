import type { AgencyClient } from "@/core/agency-core";

export type NewClientFormInput = {
  companyName: string;
  responsibleName: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  googleBusiness: string;
  city: string;
  country: string;
  segment: string;
  employeeCount: string;
  mainObjective: string;
  notes: string;
};

export type SaveClientContext = {
  organizationId: string;
  agencyId: string;
};

export type SaveClientResult = {
  companyId: string;
  client: ReturnType<AgencyClient["toJSON"]>;
  profile: NewClientFormInput;
};
