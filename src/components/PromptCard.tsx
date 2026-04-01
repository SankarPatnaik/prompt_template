import { Link } from 'react-router-dom';
import { Prompt } from '../types';
import { formatDate } from '../utils';

export const PromptCard = ({ prompt }: { prompt: Prompt }): JSX.Element => (
  <article className="rounded-lg border bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-start justify-between gap-3">
      <h3 className="text-lg font-semibold">{prompt.title}</h3>
      {prompt.shared && <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Shared</span>}
    </div>
    <p className="mb-3 text-sm text-slate-600">{prompt.description || 'No description provided.'}</p>
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700">{prompt.category}</span>
      {prompt.tags.map((tag) => (
        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700" key={tag}>
          #{tag}
        </span>
      ))}
    </div>
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>{prompt.createdBy}</span>
      <span>{formatDate(prompt.updatedDate)}</span>
    </div>
    <Link className="mt-3 inline-flex text-sm font-medium text-blue-600" to={`/prompts/${prompt.id}`}>
      View details →
    </Link>
  </article>
);
