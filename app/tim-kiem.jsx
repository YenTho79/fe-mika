import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  BookListItem,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingSkeleton,
  Screen,
  SearchField,
  SectionHeader,
} from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { useLocalBooks } from '../hooks/useLocalBooks';
import { addSearchHistory, clearSearchHistory, getSearchHistory } from '../services/localDataService';

const POPULAR_KEYWORDS = ['Viễn tưởng', 'Kiếm hiệp', 'Ngôn tình', 'Trinh thám', 'Huyền huyễn'];
const normalizeText = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase();
const viewScore = (value) => {
  const text = String(value || 0).toUpperCase();
  const number = Number.parseFloat(text) || 0;
  return text.includes('M') ? number * 1000000 : text.includes('K') ? number * 1000 : number;
};

function GridBook({ book, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.gridBook}>
      <Image source={{ uri: book.cover }} style={styles.gridCover} />
      <Text numberOfLines={2} style={styles.gridTitle}>{book.title}</Text>
      <Text numberOfLines={1} style={styles.gridAuthor}>{book.author}</Text>
      <View style={styles.gridMeta}>
        <Ionicons name="star" size={13} color={colors.tertiary} />
        <Text style={styles.gridRating}>{book.rating}</Text>
        <Text style={styles.gridViews}>• {book.views}</Text>
      </View>
    </Pressable>
  );
}

export default function Search() {
  const router = useRouter();
  const { books, loading, error, reload } = useLocalBooks();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [category, setCategory] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [minRating, setMinRating] = useState(0);
  const [onlyNewest, setOnlyNewest] = useState(false);
  const [sort, setSort] = useState('Phổ biến');
  const [layout, setLayout] = useState('list');

  useEffect(() => { getSearchHistory().then(setHistory); }, []);

  const categories = useMemo(
    () => ['Tất cả', ...new Set(books.flatMap((book) => book.categories || [book.category]).filter(Boolean))],
    [books]
  );
  const newestIds = useMemo(
    () => new Set([...books].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 6).map((book) => book.id)),
    [books]
  );
  const results = useMemo(() => {
    const keyword = normalizeText(query.trim());
    return books.filter((book) => {
      const haystack = normalizeText([book.title, book.author, ...(book.categories || [book.category])].filter(Boolean).join(' '));
      return (!keyword || haystack.includes(keyword))
        && (category === 'Tất cả' || (book.categories || [book.category]).includes(category))
        && (status === 'Tất cả' || book.status === status)
        && Number(book.rating || 0) >= minRating
        && (!onlyNewest || newestIds.has(book.id));
    }).sort((a, b) => {
      if (sort === 'Điểm cao') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sort === 'Mới cập nhật') return new Date(b.publishedAt) - new Date(a.publishedAt);
      return viewScore(b.views) - viewScore(a.views);
    });
  }, [books, category, minRating, newestIds, onlyNewest, query, sort, status]);

  const chooseKeyword = async (value) => {
    setQuery(value);
    setHistory(await addSearchHistory(value));
  };
  const submitSearch = async () => {
    if (query.trim()) setHistory(await addSearchHistory(query));
  };
  const clearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };
  const openBook = (book) => router.push({ pathname: '/chi-tiet', params: { id: book.id } });
  const hasSearch = Boolean(query.trim()) || category !== 'Tất cả' || status !== 'Tất cả' || minRating > 0 || onlyNewest;

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Tìm kiếm" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SearchField
          autoFocus
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          placeholder="Tên truyện, tác giả, thể loại..."
        />

        {!hasSearch ? (
          <>
            {history.length ? (
              <>
                <SectionHeader title="Tìm kiếm gần đây" action="Xóa" onPress={clearHistory} />
                <View style={styles.wrapChips}>
                  {history.map((item) => <FilterChip key={item} label={item} icon="time-outline" onPress={() => chooseKeyword(item)} />)}
                </View>
              </>
            ) : null}
            <SectionHeader title="Từ khóa phổ biến" />
            <View style={styles.wrapChips}>
              {POPULAR_KEYWORDS.map((item) => <FilterChip key={item} label={item} icon="trending-up" onPress={() => chooseKeyword(item)} />)}
            </View>
          </>
        ) : null}

        <SectionHeader title="Bộ lọc" subtitle="Lọc trực tiếp trên dữ liệu local" />
        <Text style={styles.filterLabel}>Thể loại</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {categories.map((item) => <FilterChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}
        </ScrollView>
        <Text style={styles.filterLabel}>Trạng thái</Text>
        <View style={styles.wrapChips}>
          {['Tất cả', 'Đang ra', 'Full'].map((item) => <FilterChip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />)}
        </View>
        <Text style={styles.filterLabel}>Đánh giá và cập nhật</Text>
        <View style={styles.wrapChips}>
          {[0, 4.5, 4.8].map((rating) => <FilterChip key={rating} label={rating ? `${rating}★ trở lên` : 'Mọi đánh giá'} active={minRating === rating} onPress={() => setMinRating(rating)} />)}
          <FilterChip label="Mới nhất" icon="sparkles-outline" active={onlyNewest} onPress={() => setOnlyNewest((value) => !value)} />
        </View>

        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultTitle}>{hasSearch ? 'Kết quả' : 'Tất cả truyện'}</Text>
            <Text style={styles.resultCount}>{results.length} truyện phù hợp</Text>
          </View>
          <View style={styles.layoutSwitch}>
            <Pressable onPress={() => setLayout('list')} style={[styles.layoutButton, layout === 'list' && styles.layoutButtonActive]}><Ionicons name="list" size={19} color={layout === 'list' ? colors.white : colors.muted} /></Pressable>
            <Pressable onPress={() => setLayout('grid')} style={[styles.layoutButton, layout === 'grid' && styles.layoutButtonActive]}><Ionicons name="grid" size={18} color={layout === 'grid' ? colors.white : colors.muted} /></Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {['Phổ biến', 'Điểm cao', 'Mới cập nhật'].map((item) => <FilterChip key={item} label={item} active={sort === item} onPress={() => setSort(item)} />)}
        </ScrollView>

        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={139} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && results.length ? (
          layout === 'list'
            ? results.map((book) => <BookListItem key={book.id} book={book} onPress={() => openBook(book)} />)
            : <View style={styles.grid}>{results.map((book) => <GridBook key={book.id} book={book} onPress={() => openBook(book)} />)}</View>
        ) : null}
        {!loading && !error && !results.length ? (
          <EmptyState icon="search-outline" title="Không tìm thấy kết quả" message="Thử đổi từ khóa hoặc bộ lọc đang chọn." />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  wrapChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterLabel: { ...typography.caption, color: colors.muted, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm },
  filterRow: { paddingBottom: spacing.xs },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.md },
  resultTitle: { ...typography.heading, color: colors.text },
  resultCount: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  layoutSwitch: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.md, padding: 3 },
  layoutButton: { width: 36, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  layoutButtonActive: { backgroundColor: colors.primaryContainer },
  sortRow: { paddingBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  gridBook: { width: '47%', marginBottom: spacing.lg },
  gridCover: { width: '100%', aspectRatio: 0.72, borderRadius: radius.md, backgroundColor: colors.surface3 },
  gridTitle: { ...typography.body, color: colors.text, fontWeight: '800', marginTop: spacing.sm },
  gridAuthor: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  gridMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  gridRating: { ...typography.caption, color: colors.text, fontWeight: '700' },
  gridViews: { ...typography.caption, color: colors.muted },
});
