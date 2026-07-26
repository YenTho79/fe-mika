import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter, ConfirmDeleteModal } from '../../../components/AdminUI';
import { EmptyState, FilterChip, PrimaryButton, Screen, Toast } from '../../../components/UI';
import { colors, radius, spacing, typography } from '../../../constants/theme';
import { deleteBookWithChapters, getAdminBooks, getAdminChapters } from '../../../services/localDataService';

const viewNumber = (value) => {
  const text = String(value || '0').toUpperCase();
  const number = parseFloat(text) || 0;
  if (text.endsWith('M')) return number * 1000000;
  if (text.endsWith('K')) return number * 1000;
  return number;
};

function Action({ icon, label, danger, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.action, danger && styles.dangerAction]}>
      <Ionicons name={icon} size={15} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

export default function BookManagement() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [chapterCounts, setChapterCounts] = useState({});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState('Mới nhất');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const [items, chapters] = await Promise.all([getAdminBooks(), getAdminChapters()]);
    setBooks(items);
    setChapterCounts(chapters.reduce((map, chapter) => ({ ...map, [chapter.bookId]: (map[chapter.bookId] || 0) + 1 }), {}));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const categories = useMemo(() => ['Tất cả', ...new Set(books.flatMap((book) => book.categories || [book.category]).filter(Boolean))], [books]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return books.filter((book) => {
      const haystack = `${book.title} ${book.author}`.toLocaleLowerCase('vi-VN');
      const categoriesOfBook = book.categories || [book.category];
      return (!needle || haystack.includes(needle))
        && (status === 'Tất cả' || book.status === status || (status === 'Hoàn thành' && book.status === 'Full'))
        && (category === 'Tất cả' || categoriesOfBook.includes(category))
        && (!featuredOnly || book.featured);
    }).sort((a, b) => {
      if (sort === 'Tên A–Z') return a.title.localeCompare(b.title, 'vi');
      if (sort === 'Lượt đọc') return viewNumber(b.views) - viewNumber(a.views);
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });
  }, [books, category, featuredOnly, query, sort, status]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const count = await deleteBookWithChapters(pendingDelete.id);
    setPendingDelete(null);
    setToast(`Đã xóa truyện và ${count} chương liên quan.`);
    load();
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Quản lý truyện" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title={`${books.length} truyện`} description="Tìm, lọc và cập nhật kho nội dung local." action={<PrimaryButton title="Thêm" icon="add" onPress={() => router.push('/admin/truyen/them')} style={{ minWidth: 94 }} />} />
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm theo tên hoặc tác giả...">
          {['Tất cả', 'Đang ra', 'Hoàn thành', 'Bản nháp', 'Tạm dừng'].map((item) => <FilterChip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />)}
          <FilterChip label="Nổi bật" icon="star-outline" active={featuredOnly} onPress={() => setFeaturedOnly((value) => !value)} />
        </AdminSearchFilter>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {categories.map((item) => <FilterChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}
        </ScrollView>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sắp xếp</Text>
          {['Mới nhất', 'Lượt đọc', 'Tên A–Z'].map((item) => <FilterChip key={item} label={item} active={sort === item} onPress={() => setSort(item)} />)}
        </View>
        {filtered.map((book) => (
          <AdminListItem key={book.id} image={book.cover} title={book.title} subtitle={`Tác giả: ${book.author}`} meta={`${chapterCounts[book.id] || 0} chương · ${book.views || 0} lượt đọc`} status={book.status}>
            <Action icon="eye-outline" label="Xem" onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })} />
            <Action icon="create-outline" label="Sửa" onPress={() => router.push({ pathname: '/admin/truyen/chinh-sua', params: { id: book.id } })} />
            <Action icon="documents-outline" label="Chương" onPress={() => router.push({ pathname: '/admin/chuong', params: { bookId: book.id } })} />
            <Action icon="trash-outline" label="Xóa" danger onPress={() => setPendingDelete(book)} />
          </AdminListItem>
        ))}
        {!filtered.length ? <EmptyState icon="library-outline" title="Không có truyện phù hợp" message="Thử đổi từ khóa hoặc bộ lọc, hoặc thêm truyện mới." actionTitle="Thêm truyện" onAction={() => router.push('/admin/truyen/them')} /> : null}
      </ScrollView>
      <ConfirmDeleteModal visible={Boolean(pendingDelete)} title="Xóa truyện và chương?" message={`“${pendingDelete?.title || ''}” có ${chapterCounts[pendingDelete?.id] || 0} chương liên quan. Thao tác sẽ xóa cả truyện và toàn bộ chương.`} confirmText="Xóa tất cả" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  row: { gap: spacing.sm, paddingBottom: spacing.md },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  sortLabel: { ...typography.caption, color: colors.muted, fontWeight: '800', marginRight: spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: 'rgba(210,187,255,0.1)' },
  dangerAction: { backgroundColor: 'rgba(255,180,171,0.1)' },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
});
