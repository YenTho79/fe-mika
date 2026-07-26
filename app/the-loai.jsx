import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader, BookListItem, EmptyState, ErrorState, FilterChip, LoadingSkeleton, Screen } from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { useLocalBooks } from '../hooks/useLocalBooks';

export default function CategoryResults() {
  const router = useRouter();
  const { name = '' } = useLocalSearchParams();
  const categoryName = Array.isArray(name) ? name[0] : name;
  const { books, loading, error, reload } = useLocalBooks();
  const [status, setStatus] = useState('Tất cả');
  const [sort, setSort] = useState('Phổ biến');
  const results = useMemo(() => books
    .filter((book) => (book.categories || [book.category]).includes(categoryName))
    .filter((book) => status === 'Tất cả' || book.status === status)
    .sort((a, b) => sort === 'Mới nhất'
      ? new Date(b.publishedAt) - new Date(a.publishedAt)
      : Number(b.rating || 0) - Number(a.rating || 0)), [books, categoryName, sort, status]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title={categoryName || 'Thể loại'} onBack={() => router.back()} rightIcon="search" onRight={() => router.push('/tim-kiem')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{categoryName || 'Thể loại'}</Text>
        <Text style={styles.subtitle}>{results.length} truyện trong thể loại này</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {['Tất cả', 'Đang ra', 'Full'].map((item) => <FilterChip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sorts}>
          {['Phổ biến', 'Mới nhất'].map((item) => <FilterChip key={item} label={item} active={sort === item} onPress={() => setSort(item)} />)}
        </ScrollView>
        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={139} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && results.map((book) => <BookListItem key={book.id} book={book} onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })} />)}
        {!loading && !error && !results.length ? <EmptyState icon="albums-outline" title="Chưa có truyện phù hợp" message="Thử chọn trạng thái khác hoặc quay lại danh sách thể loại." /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  filters: { paddingTop: spacing.xl, paddingBottom: spacing.md },
  sorts: { paddingBottom: spacing.xl },
});
