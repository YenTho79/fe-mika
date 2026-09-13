import { useTheme } from '../../hooks/useTheme';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter, ConfirmDeleteModal } from '../../components/AdminUI';
import { EmptyState, FilterChip, Screen, Toast } from '../../components/UI';
import { radius, spacing, typography } from '../../constants/theme';
import { deleteReview, formatDisplayDate, getAdminBooks, getCurrentUser, getReviews, updateReview } from '../../services/localDataService';

function Action({ icon, label, danger, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return <Pressable onPress={onPress} style={[styles.action, danger && styles.danger]}><Ionicons name={icon} size={15} color={danger ? colors.danger : colors.primary} /><Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text></Pressable>; }

export default function ReviewManagement() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const router = useRouter();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('all');
  const [status, setStatus] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState('');
  const load = useCallback(async () => {
    const [items, bookItems, currentUser] = await Promise.all([getReviews(), getAdminBooks(), getCurrentUser()]);
    setReviews([...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    setBooks(bookItems);
    setUser(currentUser);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const bookMap = useMemo(() => Object.fromEntries(books.map((book) => [String(book.id), book])), [books]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return reviews.filter((review) => (!needle || `${review.userName} ${review.content} ${bookMap[String(review.bookId)]?.title || ''}`.toLocaleLowerCase('vi-VN').includes(needle))
      && (rating === 'all' || Number(review.rating) === Number(rating))
      && (status === 'all' || review.status === status));
  }, [bookMap, query, rating, reviews, status]);

  const toggleVisibility = async (review) => {
    const next = review.status === 'hidden' ? 'approved' : 'hidden';
    await updateReview(review.id, { status: next }, user?.token);
    setToast(next === 'hidden' ? 'Đã ẩn đánh giá.' : 'Đã khôi phục đánh giá.');
    load();
  };

  const remove = async () => {
    if (pendingDelete) {
      await deleteReview(pendingDelete.id, user?.token);
      setToast('Đã xóa đánh giá vĩnh viễn.');
      setPendingDelete(null);
      load();
    }
  };

  return (
    <Screen>
      <AdminHeader title="Quản lý Đánh giá" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminPageTitle title="Đánh giá từ người dùng" subtitle="Kiểm duyệt và quản lý phản hồi" />
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm người viết, truyện hoặc nội dung...">
          {['all', '5', '4', '3', '2', '1'].map((item) => <FilterChip key={item} label={item === 'all' ? 'Mọi số sao' : `${item} sao`} active={rating === item} onPress={() => setRating(item)} />)}
        {[['all', 'Mọi trạng thái'], ['approved', 'Hiển thị'], ['hidden', 'Đã ẩn']].map(([value, label]) => <FilterChip key={value} label={label} active={status === value} onPress={() => setStatus(value)} />)}
        </AdminSearchFilter>
        {filtered.map((review) => <AdminListItem key={review.id} icon="star-outline" title={`${review.userName} · ${review.rating}★`} subtitle={review.content} meta={`${bookMap[String(review.bookId)]?.title || review.bookId} · ${formatDisplayDate(review.createdAt, true)}`} status={review.status === 'hidden' ? 'locked' : 'active'} statusLabel={review.status === 'hidden' ? 'Đã ẩn' : 'Hiển thị'}>
          <Action icon="book-outline" label="Xem truyện" onPress={() => router.push({ pathname: '/chi-tiet', params: { id: review.bookId } })} />
          <Action icon={review.status === 'hidden' ? 'eye-outline' : 'eye-off-outline'} label={review.status === 'hidden' ? 'Khôi phục' : 'Ẩn'} onPress={() => toggleVisibility(review)} />
          <Action icon="trash-outline" label="Xóa" danger onPress={() => setPendingDelete(review)} />
        </AdminListItem>)}
        {!filtered.length ? <EmptyState icon="star-outline" title="Không có đánh giá phù hợp" /> : null}
      </ScrollView>
      <ConfirmDeleteModal visible={Boolean(pendingDelete)} title="Xóa đánh giá?" message="Đánh giá sẽ bị xóa vĩnh viễn khỏi dữ liệu local." confirmText="Xóa" onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.emptyCircleBg },
  danger: { backgroundColor: 'rgba(255,180,171,0.1)' },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
});
