import { ArticleForm } from '../../../components/admin/AdminForms';
import { useTheme } from '../../../hooks/useTheme';
export default function EditArticle() {
  const { colors } = useTheme();
 return <ArticleForm mode="edit" />; }
