import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { Prompt } from './types';
import { getStoredCategories, getStoredPrompts, saveCategories, savePrompts } from './utils';

interface PromptContextValue {
  prompts: Prompt[];
  categories: string[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updatePrompt: (id: string, prompt: Omit<Prompt, 'id' | 'createdDate'>) => void;
  deletePrompt: (id: string) => void;
  addCategory: (category: string) => void;
}

const PromptContext = createContext<PromptContextValue | null>(null);

const makeId = (title: string) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(16).slice(2, 8)}`;

export const PromptProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [prompts, setPrompts] = useState<Prompt[]>(() => getStoredPrompts());
  const [categories, setCategories] = useState<string[]>(() => getStoredCategories());

  const addPrompt: PromptContextValue['addPrompt'] = (payload) => {
    const now = new Date().toISOString();
    const next = [{ ...payload, id: makeId(payload.title), createdDate: now, updatedDate: now }, ...prompts];
    setPrompts(next);
    savePrompts(next);
    if (!categories.includes(payload.category)) {
      const nextCategories = [...categories, payload.category];
      setCategories(nextCategories);
      saveCategories(nextCategories);
    }
  };

  const updatePrompt: PromptContextValue['updatePrompt'] = (id, payload) => {
    const next = prompts.map((prompt) =>
      prompt.id === id ? { ...payload, id: prompt.id, createdDate: prompt.createdDate, updatedDate: new Date().toISOString() } : prompt,
    );
    setPrompts(next);
    savePrompts(next);
  };

  const deletePrompt = (id: string) => {
    const next = prompts.filter((prompt) => prompt.id !== id);
    setPrompts(next);
    savePrompts(next);
  };

  const addCategory = (category: string) => {
    if (!category.trim() || categories.includes(category.trim())) return;
    const next = [...categories, category.trim()];
    setCategories(next);
    saveCategories(next);
  };

  const value = useMemo(
    () => ({ prompts, categories, addPrompt, updatePrompt, deletePrompt, addCategory }),
    [prompts, categories],
  );

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
};

export const usePrompts = (): PromptContextValue => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompts must be used inside PromptProvider');
  }
  return context;
};
