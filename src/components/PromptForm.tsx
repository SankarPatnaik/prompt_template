import { FormEvent, useMemo, useState } from 'react';
import { Prompt } from '../types';

type PromptInput = Omit<Prompt, 'id' | 'createdDate' | 'updatedDate'>;

interface PromptFormProps {
  categories: string[];
  initialValue?: PromptInput;
  onSubmit: (payload: PromptInput) => void;
  submitLabel: string;
}

const emptyPrompt: PromptInput = {
  title: '',
  description: '',
  content: '',
  category: 'AI / GenAI',
  tags: [],
  createdBy: '',
  shared: false,
};

export const PromptForm = ({ categories, initialValue, onSubmit, submitLabel }: PromptFormProps): JSX.Element => {
  const seed = useMemo(() => initialValue ?? emptyPrompt, [initialValue]);
  const [form, setForm] = useState(seed);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return;
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim(),
      createdBy: form.createdBy.trim() || 'unknown',
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    });
  };

  return (
    <form className="space-y-4 rounded-lg border bg-white p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Title*
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="text-sm font-medium">Created by
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.createdBy} onChange={(e) => setForm({ ...form, createdBy: e.target.value })} />
        </label>
      </div>
      <label className="block text-sm font-medium">Description
        <textarea className="mt-1 w-full rounded border px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label className="block text-sm font-medium">Prompt content / template*
        <textarea className="mt-1 w-full rounded border px-3 py-2 font-mono" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Project category
          <select className="mt-1 w-full rounded border px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">Tags (comma separated)
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.tags.join(', ')}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',') })}
          />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-medium">
        <input checked={form.shared} onChange={(e) => setForm({ ...form, shared: e.target.checked })} type="checkbox" />
        Shared across team
      </label>
      <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">{submitLabel}</button>
    </form>
  );
};
