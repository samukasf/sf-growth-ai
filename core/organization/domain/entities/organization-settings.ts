import type { OrganizationId, OrganizationSettingsId } from "../../shared";

export type OrganizationSettingsProps = {
  id: OrganizationSettingsId;
  organizationId: OrganizationId;
  fiscalYearStart: string;
  workingDays: string[];
  defaultApprovalCurrency: string;
  enableAudit: boolean;
  enableMultiDepartment: boolean;
  dashboardPersonalization: boolean;
};

export class OrganizationSettings {
  readonly id: OrganizationSettingsId;
  readonly organizationId: OrganizationId;
  readonly fiscalYearStart: string;
  readonly workingDays: string[];
  readonly defaultApprovalCurrency: string;
  readonly enableAudit: boolean;
  readonly enableMultiDepartment: boolean;
  readonly dashboardPersonalization: boolean;

  private constructor(props: OrganizationSettingsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.fiscalYearStart = props.fiscalYearStart;
    this.workingDays = [...props.workingDays];
    this.defaultApprovalCurrency = props.defaultApprovalCurrency;
    this.enableAudit = props.enableAudit;
    this.enableMultiDepartment = props.enableMultiDepartment;
    this.dashboardPersonalization = props.dashboardPersonalization;
  }

  static create(
    props: Omit<OrganizationSettingsProps, "id"> & { id?: OrganizationSettingsId },
  ): OrganizationSettings {
    return new OrganizationSettings({
      id: props.id ?? `org-settings-${Date.now()}`,
      organizationId: props.organizationId,
      fiscalYearStart: props.fiscalYearStart,
      workingDays: props.workingDays,
      defaultApprovalCurrency: props.defaultApprovalCurrency,
      enableAudit: props.enableAudit,
      enableMultiDepartment: props.enableMultiDepartment,
      dashboardPersonalization: props.dashboardPersonalization,
    });
  }

  toJSON(): OrganizationSettingsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      fiscalYearStart: this.fiscalYearStart,
      workingDays: [...this.workingDays],
      defaultApprovalCurrency: this.defaultApprovalCurrency,
      enableAudit: this.enableAudit,
      enableMultiDepartment: this.enableMultiDepartment,
      dashboardPersonalization: this.dashboardPersonalization,
    };
  }
}
