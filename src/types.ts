export type PromptCategory =
  | 'KYC'
  | 'Legal'
  | 'CRM'
  | 'Data Governance'
  | 'AI / GenAI'
  | 'Compliance'
  | 'Sales'
  | 'Marketing'
  | 'Other'
  | string;

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  shared: boolean;
}

export interface PromptFilters {
  query: string;
  category: string;
  tag: string;
  sharedOnly: boolean;
}
