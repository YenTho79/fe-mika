import { useTheme } from '../../../hooks/useTheme';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter, ConfirmDeleteModal } from '../../../components/AdminUI';
import { EmptyState, FilterChip, PrimaryButton, Screen, Toast } from '../../../components/UI';
import { radius, spacing, typography } from '../../../constants/theme';
import { deleteChapter, getAdminBooks, getAdminChapters, moveChapter } from '../../../services/localDataService';

function IconAction({ icon, disabled, danger, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.iconAction, disabled && { opacity: 0.35 }, danger && styles.danger]}>
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
    </Pressable>
  );
}

export default function ChapterManagement() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const router = useRouter();
  const params = useLocalSearchParams();
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState(params.bookId || '');
  const [chapters, setChapters] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const items = await getAdminBooks();
    const selectedId = bookId || params.bookId || items[0]?.id || '';
    setBooks(items);
    if (selectedId !== bookId) setBookId(selectedId);
    setChapters(selectedId ? await getAdminChapters(selectedId) : []);
  }, [bookId, params.bookId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const selectBook = async (id) => {
    setBookId(id);
    setChapters(await getAdminChapters(id));
  };
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return chapters.filter((chapter) => {
      const matchesQuery = !needle || `${chapter.number} ${chapter.title}`.toLocaleLowerCase('vi-VN').includes(needle);
      const matchesStatus = status === 'all' || (status === 'draft' ? chapter.status === 'draft' : chapter.status !== 'draft');
      return matchesQuery && matchesStatus;
    });
  }, [chapters, query, status]);
  const currentBook = books.find((item) => String(item.id) === String(bookId));

  const move = async (chapter, direction) => {
    setChapters(await moveChapter(bookId, chapter.id, direction));
    setToast('Đã cập nhật thứ tự chương.');
  };
  const remove = async () => {
    if (!pendingDelete) return;
    await deleteChapter(pendingDelete.id);
    setPendingDelete(null);
    setToast('Đã xóa chương.');
    setChapters(await getAdminChapters(bookId));
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Quản lý chương" back />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title={currentBook?.title || 'Chọn truyện'} description={`${chapters.length} chương`} action={<PrimaryButton title="Thêm chương" onPress={() => router.push({ pathname: '/admin/chuong/them', params: { bookId } })} style={{ minWidth: 120 }} />} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.books}>
          {books.map((book) => <FilterChip key={book.id} label={book.title} active={String(book.id) === String(bookId)} onPress={() => selectBook(book.id)} />)}
        </ScrollView>
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm tên hoặc số chương...">
          <FilterChip label="Tất cả" active={status === 'all'} onPress={() => setStatus('all')} />
          <FilterChip label="Đã đăng" active={status === 'published'} onPress={() => setStatus('published')} />
          <FilterChip label="Bản nháp" active={status === 'draft'} onPress={() => setStatus('draft')} />
        </AdminSearchFilter>
        {filtered.map((chapter, index) => (
          <AdminListItem
            key={chapter.id}
            icon={chapter.locked ? 'lock-closed-outline' : 'gift-outline'}
            title={`Chương ${chapter.number}: ${chapter.title}`}
            subtitle={chapter.locked ? `${chapter.coinPrice || 0} xu` : 'Miễn phí'}
            meta={chapter.publishedAt || 'Chưa đặt ngày'}
            status={chapter.status === 'draft' ? 'warning' : 'success'}
            statusLabel={chapter.status === 'draft' ? 'Bản nháp' : 'Đã đăng'}
          >
            <IconAction icon="arrow-up" disabled={index === 0 || query || status !== 'all'} onPress={() => move(chapter, 'up')} />
            <IconAction icon="arrow-down" disabled={index === filtered.length - 1 || query || status !== 'all'} onPress={() => move(chapter, 'down')} />
            <IconAction icon="eye-outline" onPress={() => router.push({ pathname: '/doc-sach', params: { bookId, chapter: chapter.id } })} />
            <IconAction icon="create-outline" onPress={() => router.push({ pathname: '/admin/chuong/chinh-sua', params: { id: chapter.id } })} />
            <IconAction icon="trash-outline" danger onPress={() => setPendingDelete(chapter)} />
          </AdminListItem>
        ))}
        {!filtered.length ? <EmptyState icon="documents-outline" title="Chưa có chương" message="Thêm chương đầu tiên hoặc thay đổi bộ lọc." actionTitle="Thêm chương" onAction={() => router.push({ pathname: '/admin/chuong/them', params: { bookId } })} /> : null}
      </ScrollView>
      <ConfirmDeleteModal visible={Boolean(pendingDelete)} title="Xóa chương?" message={`Chương ${pendingDelete?.number || ''}: ${pendingDelete?.title || ''} sẽ bị xóa khỏi truyện và trình đọc.`} confirmText="Xóa chương" onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  books: { gap: spacing.sm, paddingBottom: spacing.lg },
  iconAction: { width: 36, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.emptyCircleBg },
  danger: { backgroundColor: 'rgba(255,180,171,0.1)' },
});
