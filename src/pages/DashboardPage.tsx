import { Link } from 'react-router-dom';
import { usePrompts } from '../context';

export const DashboardPage = (): JSX.Element => {
  const { prompts, categories } = usePrompts();
  const sharedCount = prompts.filter((prompt) => prompt.shared).length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-slate-600">Manage reusable prompt templates by business category.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">Total prompts</p><p className="text-2xl font-bold">{prompts.length}</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">Shared prompts</p><p className="text-2xl font-bold">{sharedCount}</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">Categories</p><p className="text-2xl font-bold">{categories.length}</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">Recent update</p><p className="text-sm font-medium">{prompts[0]?.updatedDate.slice(0, 10) ?? 'N/A'}</p></div>
      </div>
      <div className="rounded-lg border bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded bg-slate-900 px-4 py-2 text-sm text-white" to="/prompts">Browse prompts</Link>
          <Link className="rounded bg-blue-600 px-4 py-2 text-sm text-white" to="/prompts/new">Create prompt</Link>
          <Link className="rounded bg-slate-200 px-4 py-2 text-sm" to="/categories">Manage categories</Link>
        </div>
      </div>
    </section>
  );
};
