import { ChapterForm } from '../../../components/admin/AdminForms';
import { useTheme } from '../../../hooks/useTheme';
export default function EditChapter() {
  const { colors } = useTheme();
 return <ChapterForm mode="edit" />; }
