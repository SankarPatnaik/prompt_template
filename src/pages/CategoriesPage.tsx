import { FormEvent, useState } from 'react';
import { usePrompts } from '../context';

export const CategoriesPage = (): JSX.Element => {
  const { categories, prompts, addCategory } = usePrompts();
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    addCategory(name);
    setName('');
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Category Management</h2>
      <form className="flex flex-wrap gap-2 rounded-lg border bg-white p-4" onSubmit={handleSubmit}>
        <input className="min-w-64 flex-1 rounded border px-3 py-2" placeholder="Add custom category" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white" type="submit">Add category</button>
      </form>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div className="rounded border bg-white p-4" key={category}>
            <p className="font-medium">{category}</p>
            <p className="text-xs text-slate-500">{prompts.filter((prompt) => prompt.category === category).length} prompts</p>
          </div>
        ))}
      </div>
    </section>
  );
};
