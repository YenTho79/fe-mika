import { BookForm } from '../../../components/admin/AdminForms';
import { useTheme } from '../../../hooks/useTheme';
export default function EditBook() {
  const { colors } = useTheme();
 return <BookForm mode="edit" />; }
