import { ArticleForm } from '../../../components/admin/AdminForms';
import { useTheme } from '../../../hooks/useTheme';
export default function AddArticle() {
  const { colors } = useTheme();
 return <ArticleForm />; }
