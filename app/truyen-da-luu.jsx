import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  ConfirmDialog,
  EmptyState,
  FilterChip,
  LoadingSkeleton,
  Screen,
  SearchField,
} from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import {
  getBooks,
  getChapters,
  getCurrentUser,
  getReadingProgressList,
  getSavedBooks,
  toggleSaveBook,
} from '../services/localDataService';

const tabs = [
  { id: 'saved', label: 'Đã lưu', icon: 'bookmark-outline' },
  { id: 'reading', label: 'Đang đọc', icon: 'book-outline' },
  { id: 'completed', label: 'Đã đọc xong', icon: 'checkmark-circle-outline' },
];
const sortOptions = [
  { id: 'saved', label: 'Mới lưu' },
  { id: 'read', label: 'Mới đọc' },
  { id: 'name', label: 'Tên truyện' },
];

export default function Library() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [progressList, setProgressList] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('saved');
  const [sort, setSort] = useState('saved');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const [allBooks, allChapters, savedBooks, progressItems] = await Promise.all([
        getBooks(),
        getChapters(),
        getSavedBooks(currentUser.id),
        getReadingProgressList(currentUser.id),
      ]);
      const savedMap = new Map(savedBooks.map((book) => [String(book.id), book.savedAt]));
      setBooks(allBooks.map((book) => ({ ...book, savedAt: savedMap.get(String(book.id)) })));
      setChapters(allChapters);
      setSavedIds(new Set(savedBooks.map((book) => String(book.id))));
      setProgressList(progressItems);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visibleItems = useMemo(() => {
    const progressMap = new Map(progressList.map((item) => [String(item.bookId), item]));
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    let items = books.map((book) => ({
      book,
      progress: progressMap.get(String(book.id)) || null,
      chapter: chapters.find((chapter) => String(chapter.id) === String(progressMap.get(String(book.id))?.chapterId)) || null,
    }));

    if (tab === 'saved') items = items.filter(({ book }) => savedIds.has(String(book.id)));
    if (tab === 'reading') items = items.filter(({ progress }) => progress && Number(progress.percent || 0) < 100);
    if (tab === 'completed') items = items.filter(({ progress }) => Number(progress?.percent || 0) >= 100);
    if (normalizedKeyword) {
      items = items.filter(({ book }) => `${book.title} ${book.author}`.toLocaleLowerCase('vi').includes(normalizedKeyword));
    }

    return items.sort((a, b) => {
      if (sort === 'name') return a.book.title.localeCompare(b.book.title, 'vi');
      if (sort === 'read') return new Date(b.progress?.updatedAt || 0) - new Date(a.progress?.updatedAt || 0);
      return new Date(b.book.savedAt || 0) - new Date(a.book.savedAt || 0);
    });
  }, [books, chapters, keyword, progressList, savedIds, sort, tab]);

  const openItem = ({ book, chapter }) => {
    if (chapter) {
      router.push({ pathname: '/doc-sach', params: { bookId: book.id, chapter: chapter.id } });
    } else {
      router.push({ pathname: '/chi-tiet', params: { id: book.id } });
    }
  };

  const removeSavedBook = async () => {
    if (!removeTarget || !user) return;
    await toggleSaveBook(user.id, removeTarget.id);
    setSavedIds((current) => {
      const next = new Set(current);
      next.delete(String(removeTarget.id));
      return next;
    });
    setRemoveTarget(null);
  };

  const emptyCopy = {
    saved: ['bookmark-outline', 'Chưa có truyện đã lưu', 'Lưu truyện yêu thích để tìm lại nhanh hơn.'],
    reading: ['book-outline', 'Chưa đọc truyện nào', 'Bắt đầu một truyện và tiến độ sẽ xuất hiện tại đây.'],
    completed: ['checkmark-circle-outline', 'Chưa hoàn thành truyện', 'Những truyện đọc đến cuối sẽ được lưu tại đây.'],
  }[tab];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Tủ sách của tôi" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.tabs}>
          {tabs.map((item) => (
            <FilterChip
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={tab === item.id}
              onPress={() => setTab(item.id)}
            />
          ))}
        </View>
        <SearchField value={keyword} onChangeText={setKeyword} placeholder="Tìm trong tủ sách..." style={styles.search} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sorts}>
          <Text style={styles.sortLabel}>Sắp xếp:</Text>
          {sortOptions.map((item) => (
            <FilterChip key={item.id} label={item.label} active={sort === item.id} onPress={() => setSort(item.id)} />
          ))}
        </ScrollView>

        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={128} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && visibleItems.map((item) => (
          <LibraryItem
            key={item.book.id}
            {...item}
            isSaved={savedIds.has(String(item.book.id))}
            onPress={() => openItem(item)}
            onRemove={() => setRemoveTarget(item.book)}
          />
        ))}
        {!loading && visibleItems.length === 0 ? (
          <EmptyState
            icon={keyword ? 'search-outline' : emptyCopy[0]}
            title={keyword ? 'Không tìm thấy truyện' : emptyCopy[1]}
            message={keyword ? 'Thử tìm bằng tên truyện hoặc tác giả khác.' : emptyCopy[2]}
            actionTitle={!keyword && tab === 'saved' ? 'Khám phá truyện' : undefined}
            onAction={() => router.replace('/kham-pha')}
          />
        ) : null}
      </ScrollView>
      <ConfirmDialog
        visible={Boolean(removeTarget)}
        title="Bỏ lưu truyện?"
        message={`“${removeTarget?.title || ''}” sẽ bị xóa khỏi tab Đã lưu. Lịch sử đọc vẫn được giữ lại.`}
        confirmText="Bỏ lưu"
        onConfirm={removeSavedBook}
        onCancel={() => setRemoveTarget(null)}
        isDanger
      />
    </Screen>
  );
}

function LibraryItem({ book, chapter, progress, isSaved, onPress, onRemove }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}>
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <View style={styles.itemInfo}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle} numberOfLines={2}>{book.title}</Text>
          {isSaved ? (
            <Pressable accessibilityLabel="Bỏ lưu truyện" onPress={onRemove} hitSlop={10}>
              <Ionicons name="bookmark" size={21} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.chapterText} numberOfLines={1}>
          {chapter ? `Chương ${chapter.number}: ${chapter.title}` : 'Chưa bắt đầu đọc'}
        </Text>
        {chapter ? (
          <Text style={styles.lastReadText}>Lần cuối đọc: Chương {chapter.number}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  search: { marginTop: spacing.lg },
  sorts: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  sortLabel: { ...typography.caption, color: colors.muted, fontWeight: '800' },
  item: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md },
  cover: { width: 76, height: 110, borderRadius: radius.sm, backgroundColor: colors.surface3 },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  itemTitle: { ...typography.title, color: colors.text, flex: 1 },
  chapterText: { ...typography.caption, color: colors.muted, marginTop: spacing.sm },
  lastReadText: { ...typography.caption, color: colors.tertiary, marginTop: spacing.sm },
});
