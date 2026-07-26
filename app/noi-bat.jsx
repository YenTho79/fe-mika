import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  SearchField,
} from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { useLocalBooks } from '../hooks/useLocalBooks';

export default function Featured() {
  const router = useRouter();
  const { books, loading, error, reload } = useLocalBooks();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const categories = useMemo(
    () => ['Tất cả', ...new Set(books.flatMap((book) => book.categories || [book.category]).filter(Boolean))],
    [books]
  );
  const filtered = books.filter((book) => {
    const text = `${book.title} ${book.author}`.toLowerCase();
    const inCategory = category === 'Tất cả' || book.categories?.includes(category) || book.category === category;
    return inCategory && text.includes(query.trim().toLowerCase());
  });

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Khám phá" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tìm câu chuyện dành cho bạn</Text>
        <SearchField value={query} onChangeText={setQuery} style={{ marginTop: spacing.lg }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {categories.map((item) => (
            <FilterChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
          ))}
        </ScrollView>

        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={139} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && filtered.map((book) => (
          <BookListItem key={book.id} book={book} onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })} />
        ))}
        {!loading && !error && filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="Không có kết quả" message="Thử đổi từ khóa hoặc thể loại đang chọn." />
        ) : null}
      </ScrollView>
      <BottomNav router={router} active="featured" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  title: { ...typography.heading, color: colors.text },
  filters: { paddingVertical: spacing.xl },
});
