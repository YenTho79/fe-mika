import { useMemo, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppHeader,
  BookListItem,
  BottomNav,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingSkeleton,
  Screen,
} from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { useLocalBooks } from '../hooks/useLocalBooks';

export default function NewBooks() {
  const router = useRouter();
  const { books, loading, error, reload } = useLocalBooks();
  const [status, setStatus] = useState('Tất cả');
  const sortedBooks = useMemo(
    () => [...books]
      .filter((book) => status === 'Tất cả' || book.status === status)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
    [books, status]
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Sách mới" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <Text style={styles.title}>Mới cập nhật</Text>
        <Text style={styles.subtitle}>Danh sách được sắp xếp trực tiếp từ kho dữ liệu local.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {['Tất cả', 'Đang ra', 'Full'].map((item) => (
            <FilterChip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />
          ))}
        </ScrollView>
        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={139} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && sortedBooks.map((book) => (
          <BookListItem key={book.id} book={book} onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })} />
        ))}
        {!loading && !error && sortedBooks.length === 0 ? <EmptyState title="Chưa có sách mới" /> : null}
      </ScrollView>
      <BottomNav router={router} active="new" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  filters: { paddingVertical: spacing.xl },
});
