import { useMemo, useState } from 'react';
import { PromptCard } from '../components/PromptCard';
import { usePrompts } from '../context';

export const PromptListPage = (): JSX.Element => {
  const { prompts, categories } = usePrompts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sharedOnly, setSharedOnly] = useState(false);

  const tags = useMemo(() => Array.from(new Set(prompts.flatMap((prompt) => prompt.tags))).sort(), [prompts]);
  const [tag, setTag] = useState('all');

  const filtered = prompts.filter((prompt) => {
    const blob = `${prompt.title} ${prompt.description} ${prompt.content} ${prompt.tags.join(' ')}`.toLowerCase();
    if (query && !blob.includes(query.toLowerCase())) return false;
    if (category !== 'all' && prompt.category !== category) return false;
    if (tag !== 'all' && !prompt.tags.includes(tag)) return false;
    if (sharedOnly && !prompt.shared) return false;
    return true;
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Prompt Library</h2>
      <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-4">
        <input className="rounded border px-3 py-2" placeholder="Search prompts..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="rounded border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="rounded border px-3 py-2" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="all">All tags</option>
          {tags.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input checked={sharedOnly} onChange={(e) => setSharedOnly(e.target.checked)} type="checkbox" />
          Shared only
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
};
