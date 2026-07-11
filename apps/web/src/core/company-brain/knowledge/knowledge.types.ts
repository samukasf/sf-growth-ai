export type KnowledgeNodeId = string;
export type KnowledgeRelationId = string;

export type KnowledgeNodeType =
  | "company"
  | "person"
  | "customer"
  | "supplier"
  | "partner"
  | "employee"
  | "product"
  | "service"
  | "campaign"
  | "project"
  | "document"
  | "meeting"
  | "task"
  | "opportunity"
  | "risk"
  | "goal"
  | "competitor"
  | "channel";

export type KnowledgeRelationType =
  | "OWNS"
  | "WORKS_WITH"
  | "SELLS"
  | "BUYS"
  | "PARTICIPATES"
  | "MANAGES"
  | "DEPENDS_ON"
  | "COMPETES_WITH"
  | "GENERATES"
  | "USES"
  | "RELATED_TO"
  | "SUPPORTS"
  | "BLOCKS"
  | "IMPLEMENTS";

export type KnowledgeNode = {
  id: KnowledgeNodeId;
  tenantId: string;
  companyId: string;
  type: KnowledgeNodeType;
  name: string;
  description: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeRelation = {
  id: KnowledgeRelationId;
  from: KnowledgeNodeId;
  to: KnowledgeNodeId;
  relation: KnowledgeRelationType;
  weight: number;
  confidence: number;
  createdAt: string;
};

export type CreateKnowledgeNodeInput = Omit<KnowledgeNode, "id" | "createdAt" | "updatedAt"> & {
  id?: KnowledgeNodeId;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateKnowledgeNodeInput = {
  id: KnowledgeNodeId;
  name?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type CreateKnowledgeRelationInput = Omit<KnowledgeRelation, "id" | "createdAt"> & {
  id?: KnowledgeRelationId;
  createdAt?: string;
};

export type KnowledgeGraphFilter = {
  tenantId?: string;
  companyId?: string;
  nodeType?: KnowledgeNodeType | KnowledgeNodeType[];
  relationType?: KnowledgeRelationType | KnowledgeRelationType[];
};

export type KnowledgeGraph = {
  tenantId: string;
  companyId: string;
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  builtAt: string;
};

export type KnowledgeGraphSummary = {
  nodeCount: number;
  relationCount: number;
  nodesByType: Partial<Record<KnowledgeNodeType, number>>;
  relationsByType: Partial<Record<KnowledgeRelationType, number>>;
  topConnectedNodes: Array<{ id: string; name: string; type: KnowledgeNodeType; connections: number }>;
  headline: string;
  highlights: string[];
};

export type KnowledgeNodeView = {
  id: string;
  type: string;
  name: string;
  description: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type KnowledgeRelationView = {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  relation: KnowledgeRelationType;
  weight: number;
  confidence: number;
};

export type KnowledgeGraphPresentation = {
  summary: KnowledgeGraphSummary;
  nodesByType: Array<{ type: string; label: string; nodes: KnowledgeNodeView[] }>;
  relations: KnowledgeRelationView[];
  neighbors: Array<{ node: KnowledgeNodeView; related: KnowledgeNodeView[]; relation: KnowledgeRelationType }>;
};

export const KNOWLEDGE_NODE_TYPE_LABELS: Record<KnowledgeNodeType, string> = {
  company: "Company",
  person: "Person",
  customer: "Customer",
  supplier: "Supplier",
  partner: "Partner",
  employee: "Employee",
  product: "Product",
  service: "Service",
  campaign: "Campaign",
  project: "Project",
  document: "Document",
  meeting: "Meeting",
  task: "Task",
  opportunity: "Opportunity",
  risk: "Risk",
  goal: "Goal",
  competitor: "Competitor",
  channel: "Channel",
};

export const KNOWLEDGE_RELATION_TYPES: KnowledgeRelationType[] = [
  "OWNS",
  "WORKS_WITH",
  "SELLS",
  "BUYS",
  "PARTICIPATES",
  "MANAGES",
  "DEPENDS_ON",
  "COMPETES_WITH",
  "GENERATES",
  "USES",
  "RELATED_TO",
  "SUPPORTS",
  "BLOCKS",
  "IMPLEMENTS",
];
