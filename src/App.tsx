import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CategoriesPage } from './pages/CategoriesPage';
import { CreatePromptPage } from './pages/CreatePromptPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditPromptPage } from './pages/EditPromptPage';
import { PromptDetailPage } from './pages/PromptDetailPage';
import { PromptListPage } from './pages/PromptListPage';

const App = (): JSX.Element => (
  <Routes>
    <Route element={<Layout />} path="/">
      <Route element={<DashboardPage />} index />
      <Route element={<PromptListPage />} path="prompts" />
      <Route element={<CreatePromptPage />} path="prompts/new" />
      <Route element={<PromptDetailPage />} path="prompts/:id" />
      <Route element={<EditPromptPage />} path="prompts/:id/edit" />
      <Route element={<CategoriesPage />} path="categories" />
      <Route element={<Navigate to="/" />} path="*" />
    </Route>
  </Routes>
);

export default App;
