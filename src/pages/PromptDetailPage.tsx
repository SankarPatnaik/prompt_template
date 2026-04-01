import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePrompts } from '../context';
import { formatDate } from '../utils';

export const PromptDetailPage = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { prompts, deletePrompt } = usePrompts();
  const prompt = prompts.find((item) => item.id === id);

  if (!prompt) {
    return <p>Prompt not found.</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{prompt.title}</h2>
          <p className="text-sm text-slate-600">Updated {formatDate(prompt.updatedDate)}</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded bg-blue-600 px-3 py-2 text-sm text-white" to={`/prompts/${prompt.id}/edit`}>Edit</Link>
          <button
            className="rounded bg-rose-600 px-3 py-2 text-sm text-white"
            onClick={() => {
              deletePrompt(prompt.id);
              navigate('/prompts');
            }}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <p className="mb-3 text-sm text-slate-700">{prompt.description}</p>
        <div className="mb-3 flex gap-2">
          <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700">{prompt.category}</span>
          {prompt.tags.map((tag) => <span className="rounded bg-slate-100 px-2 py-1 text-xs" key={tag}>{tag}</span>)}
        </div>
        <pre className="overflow-x-auto rounded bg-slate-900 p-4 text-sm text-slate-100">{prompt.content}</pre>
        <p className="mt-2 text-xs text-slate-500">Created by {prompt.createdBy} on {formatDate(prompt.createdDate)}</p>
      </div>
    </section>
  );
};
