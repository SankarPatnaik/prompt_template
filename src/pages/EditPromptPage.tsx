import { useNavigate, useParams } from 'react-router-dom';
import { PromptForm } from '../components/PromptForm';
import { usePrompts } from '../context';

export const EditPromptPage = (): JSX.Element => {
  const { id } = useParams();
  const { categories, prompts, updatePrompt } = usePrompts();
  const navigate = useNavigate();
  const prompt = prompts.find((item) => item.id === id);

  if (!prompt) {
    return <p>Prompt not found.</p>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Edit Prompt</h2>
      <PromptForm
        categories={categories}
        initialValue={{
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          createdBy: prompt.createdBy,
          shared: prompt.shared,
        }}
        onSubmit={(payload) => {
          updatePrompt(prompt.id, payload);
          navigate(`/prompts/${prompt.id}`);
        }}
        submitLabel="Update prompt"
      />
    </section>
  );
};
