import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  ConfirmDialog,
  EmptyState,
  LoadingSkeleton,
  Screen,
} from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import {
  deleteReadingProgress,
  formatDisplayDate,
  getBooks,
  getChapters,
  getCurrentUser,
  getReadingProgressList,
} from '../services/localDataService';

const DAY = 24 * 60 * 60 * 1000;

export default function ReadingHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const [progressList, books, chapters] = await Promise.all([
        getReadingProgressList(currentUser.id),
        getBooks(),
        getChapters(),
      ]);
      setItems(progressList.map((progress) => ({
        progress,
        book: books.find((book) => String(book.id) === String(progress.bookId)),
        chapter: chapters.find((chapter) => String(chapter.id) === String(progress.chapterId)),
      })).filter((item) => item.book));
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const groups = useMemo(() => {
    const result = { 'Hôm nay': [], 'Tuần này': [], 'Cũ hơn': [] };
    const now = Date.now();
    items.forEach((item) => {
      const elapsed = now - new Date(item.progress.updatedAt || 0).getTime();
      const key = elapsed < DAY ? 'Hôm nay' : elapsed < DAY * 7 ? 'Tuần này' : 'Cũ hơn';
      result[key].push(item);
    });
    return result;
  }, [items]);

  const confirmDelete = async () => {
    if (!user) return;
    if (deleteTarget === 'all') {
      await deleteReadingProgress(user.id);
      setItems([]);
    } else if (deleteTarget?.book?.id) {
      await deleteReadingProgress(user.id, deleteTarget.book.id);
      setItems((current) => current.filter((item) => String(item.book.id) !== String(deleteTarget.book.id)));
    }
    setDeleteTarget(null);
  };

  const openReader = ({ book, chapter }) => router.push({
    pathname: '/doc-sach',
    params: { bookId: book.id, ...(chapter ? { chapter: chapter.id } : {}) },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader
        title="Lịch sử đọc"
        onBack={() => router.back()}
        rightElement={items.length ? (
          <Pressable accessibilityLabel="Xóa toàn bộ lịch sử" onPress={() => setDeleteTarget('all')} style={styles.deleteAll}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        ) : null}
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={110} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && Object.entries(groups).map(([label, groupItems]) => groupItems.length ? (
          <View key={label}>
            <Text style={styles.groupTitle}>{label}</Text>
            {groupItems.map((item) => (
              <HistoryItem
                key={item.book.id}
                {...item}
                onPress={() => openReader(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </View>
        ) : null)}
        {!loading && !items.length ? (
          <EmptyState
            icon="time-outline"
            title="Chưa có lịch sử đọc"
            message="Truyện bạn mở sẽ xuất hiện ở đây để có thể tiếp tục chỉ bằng một lần chạm."
            actionTitle="Khám phá truyện"
            onAction={() => router.replace('/kham-pha')}
          />
        ) : null}
      </ScrollView>
      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title={deleteTarget === 'all' ? 'Xóa toàn bộ lịch sử?' : 'Xóa khỏi lịch sử?'}
        message={deleteTarget === 'all'
          ? 'Toàn bộ tiến độ và vị trí đọc gần nhất sẽ bị xóa. Thao tác này không thể hoàn tác.'
          : `Tiến độ của “${deleteTarget?.book?.title || ''}” sẽ bị xóa.`}
        confirmText="Xóa"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDanger
      />
    </Screen>
  );
}

function HistoryItem({ book, chapter, progress, onPress, onDelete }) {
  return (
    <View style={styles.item}>
      <Pressable onPress={onPress} style={styles.itemMain}>
        <Image source={{ uri: book.cover }} style={styles.cover} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
          <Text style={styles.chapter} numberOfLines={1}>
            {chapter ? `Chương ${chapter.number}: ${chapter.title}` : 'Chương gần nhất'}
          </Text>
          <Text style={styles.time}>Đọc lúc {formatDisplayDate(progress.updatedAt, true)} · {progress.percent || 0}%</Text>
        </View>
      </Pressable>
      <Pressable accessibilityLabel="Xóa mục lịch sử" onPress={onDelete} hitSlop={10}>
        <Ionicons name="close-circle-outline" size={22} color={colors.outline} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  deleteAll: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { ...typography.title, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md },
  itemMain: { flex: 1, flexDirection: 'row', gap: spacing.md },
  cover: { width: 58, height: 82, borderRadius: radius.sm, backgroundColor: colors.surface3 },
  info: { flex: 1, justifyContent: 'center' },
  title: { ...typography.title, color: colors.text },
  chapter: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  time: { ...typography.caption, color: colors.tertiary, marginTop: spacing.sm },
});
