import { useNavigate } from 'react-router-dom';
import { PromptForm } from '../components/PromptForm';
import { usePrompts } from '../context';

export const CreatePromptPage = (): JSX.Element => {
  const { categories, addPrompt } = usePrompts();
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Create Prompt</h2>
      <PromptForm
        categories={categories}
        onSubmit={(payload) => {
          addPrompt(payload);
          navigate('/prompts');
        }}
        submitLabel="Save prompt"
      />
    </section>
  );
};
