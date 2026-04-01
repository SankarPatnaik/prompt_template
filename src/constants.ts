export const DEFAULT_CATEGORIES = [
  'KYC',
  'Legal',
  'CRM',
  'Data Governance',
  'AI / GenAI',
  'Compliance',
  'Sales',
  'Marketing',
  'Other',
] as const;

export const STORAGE_KEYS = {
  prompts: 'prompt-template.prompts',
  categories: 'prompt-template.categories',
};
