import legacyStore from './data/legacy-prompts.json';
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from './constants';
import { Prompt } from './types';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const inferCategory = (useCase: string, tags: string[]): string => {
  const lc = `${useCase} ${tags.join(' ')}`.toLowerCase();
  if (lc.includes('legal')) return 'Legal';
  if (lc.includes('compliance')) return 'Compliance';
  if (lc.includes('crm') || lc.includes('sales')) return 'CRM';
  if (lc.includes('marketing') || lc.includes('email')) return 'Marketing';
  if (lc.includes('data') || lc.includes('sql') || lc.includes('governance')) return 'Data Governance';
  return 'AI / GenAI';
};

export const mapLegacyPrompts = (): Prompt[] => {
  const templates = (legacyStore as { templates?: Array<Record<string, unknown>> }).templates ?? [];
  return templates.map((template) => {
    const system = typeof template.system === 'string' ? template.system : '';
    const user = typeof template.user === 'string' ? template.user : '';
    const title = typeof template.name === 'string' ? template.name : 'Untitled Prompt';
    const tags = Array.isArray(template.tags) ? template.tags.filter((tag): tag is string => typeof tag === 'string') : [];
    const createdDate = typeof template.created_at === 'string' ? template.created_at : new Date().toISOString();
    const updatedDate = typeof template.updated_at === 'string' ? template.updated_at : createdDate;
    const useCase = typeof template.use_case === 'string' ? template.use_case : '';

    return {
      id: typeof template.id === 'string' ? template.id : slugify(title),
      title,
      description: typeof template.description === 'string' ? template.description : '',
      content: [system, user].filter(Boolean).join('\n\n'),
      category: inferCategory(useCase, tags),
      tags,
      createdBy: typeof template.owner === 'string' ? template.owner : 'unknown',
      createdDate,
      updatedDate,
      shared: (typeof template.status === 'string' ? template.status : '').toLowerCase() === 'approved',
    };
  });
};

export const getStoredCategories = (): string[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.categories);
  if (!raw) {
    return [...DEFAULT_CATEGORIES];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed])) : [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
};

export const getStoredPrompts = (): Prompt[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.prompts);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Prompt[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
  }
  const seeded = mapLegacyPrompts();
  localStorage.setItem(STORAGE_KEYS.prompts, JSON.stringify(seeded));
  return seeded;
};

export const savePrompts = (prompts: Prompt[]): void => {
  localStorage.setItem(STORAGE_KEYS.prompts, JSON.stringify(prompts));
};

export const saveCategories = (categories: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(Array.from(new Set(categories))));
};

export const formatDate = (value: string): string => new Date(value).toLocaleDateString();
