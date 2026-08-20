import { BookForm } from '../../../components/admin/AdminForms';
import { useTheme } from '../../../hooks/useTheme';
export default function AddBook() {
  const { colors } = useTheme();
 return <BookForm />; }
