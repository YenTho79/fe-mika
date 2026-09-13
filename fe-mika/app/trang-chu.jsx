import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  BookCard,
  BottomNav,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  Screen,
  SectionHeader,
} from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import {
  getArticles,
  getAdminSettings,
  getChapters,
  getCurrentUser,
  getReadingProgressList,
  restoreDemoContent,
} from '../services/localDataService';
import { useLocalBooks } from '../hooks/useLocalBooks';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const bannerWidth = Math.max(280, Math.min(width - spacing.xl * 2, 720));
  const carouselRef = useRef(null);
  const { books, loading, error, reload } = useLocalBooks();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [adminSettings, setAdminSettings] = useState({ appName: 'Mika Books', bannerTitle: 'ĐỀ XUẤT HÔM NAY', bannerSubtitle: '' });

  const loadData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const [localArticles, localChapters, localProgress, localAdminSettings] = await Promise.all([
        getArticles(),
        getChapters(),
        currentUser ? getReadingProgressList(currentUser.id) : [],
        getAdminSettings(),
      ]);
      setUser(currentUser);
      setArticles(localArticles);
      setChapters(localChapters);
      setProgressItems(localProgress);
      setAdminSettings(localAdminSettings);
      await reload();
    } catch (loadError) {
      console.error('Không thể nạp trang chủ:', loadError);
    }
  }, [reload]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const featured = useMemo(() => books.filter((book) => book.featured).slice(0, 6), [books]);
  const banners = (featured.length ? featured : books).slice(0, 3);
  const newest = useMemo(
    () => [...books].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 6),
    [books]
  );
  const latestArticles = useMemo(
    () => [...articles].filter((item) => item.status === 'published').sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 3),
    [articles]
  );
  const reading = progressItems.map((progress) => ({
    progress,
    book: books.find((book) => String(book.id) === String(progress.bookId)),
    chapter: chapters.find((chapter) => String(chapter.id) === String(progress.chapterId)),
  })).filter((item) => item.book);
  const readCategories = new Set(reading.flatMap(({ book }) => book.categories || [book.category]).filter(Boolean));
  const recommendations = books
    .filter((book) => !reading.some((item) => String(item.book.id) === String(book.id)))
    .filter((book) => !readCategories.size || (book.categories || [book.category]).some((category) => readCategories.has(category)))
    .slice(0, 6);

  const openBook = (book) => router.push({ pathname: '/chi-tiet', params: { id: book.id } });
  const openReader = ({ book, chapter }) => router.push({
    pathname: '/doc-sach',
    params: { bookId: book.id, ...(chapter ? { chapter: chapter.id } : {}) },
  });
  const restoreData = async () => {
    setRestoring(true);
    try {
      await restoreDemoContent();
      await reload();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{adminSettings.appName.toLocaleUpperCase('vi-VN')}</Text>
            <Text style={styles.greeting}>Xin chào, {user?.name?.split(' ').at(-1) || 'độc giả'}</Text>
          </View>
          <Pressable accessibilityLabel="Tìm kiếm" onPress={() => router.push('/tim-kiem')} style={styles.headerButton}>
            <Ionicons name="search" size={21} color={colors.primary} />
          </Pressable>
          <Pressable accessibilityLabel="Tài khoản" onPress={() => router.push('/tai-khoan')} style={styles.avatar}>
            {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImage} /> : <Ionicons name="person" size={22} color={colors.primary} />}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/tim-kiem')} style={styles.searchPrompt}>
          <Ionicons name="search" size={20} color={colors.outline} />
          <Text style={styles.searchPromptText}>Tìm theo truyện, tác giả hoặc thể loại...</Text>
        </Pressable>

        {loading ? (
          <View style={styles.loadingBlock}>
            <LoadingSkeleton height={220} borderRadius={radius.xl} />
            <LoadingSkeleton width="55%" height={24} />
            <LoadingSkeleton height={140} />
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : books.length === 0 ? (
          <EmptyState
            icon="library-outline"
            title="Thư viện đang trống"
            message="Dữ liệu truyện demo đã bị xóa khỏi thiết bị. Bạn có thể khôi phục ngay."
            actionTitle={restoring ? 'Đang khôi phục...' : 'Khôi phục dữ liệu demo'}
            onAction={restoring ? undefined : restoreData}
          />
        ) : (
          <>
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              snapToInterval={bannerWidth}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => setActiveBanner(Math.round(event.nativeEvent.contentOffset.x / bannerWidth))}
              style={styles.carousel}
            >
              {banners.map((book, index) => (
                <Pressable key={book.id} onPress={() => openBook(book)} style={[styles.hero, { width: bannerWidth }]}>
                  <Image source={{ uri: book.cover }} style={styles.heroImage} />
                  <View style={styles.heroShade} />
                  <View style={styles.heroText}>
                    <Text style={styles.heroLabel}>{index === 0 ? adminSettings.bannerTitle.toLocaleUpperCase('vi-VN') : 'NỔI BẬT TRÊN MIKA'}</Text>
                    <Text style={styles.heroTitle} numberOfLines={2}>{book.title}</Text>
                    <Text style={styles.heroMeta} numberOfLines={1}>{index === 0 && adminSettings.bannerSubtitle ? adminSettings.bannerSubtitle : `${book.author}  •  ${book.rating} ★`}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            {banners.length > 1 ? (
              <View style={styles.dots}>
                {banners.map((book, index) => <View key={book.id} style={[styles.dot, activeBanner === index && styles.dotActive]} />)}
              </View>
            ) : null}

            <SectionHeader title="Đang đọc" subtitle={reading.length ? 'Tiếp tục từ chương gần nhất' : 'Hành trình của bạn sẽ xuất hiện ở đây'} />
            {reading.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reading.map((item) => (
                  <Pressable key={item.book.id} onPress={() => openReader(item)} style={styles.continueCard}>
                    <Image source={{ uri: item.book.cover }} style={styles.continueCover} />
                    <View style={styles.continueInfo}>
                      <Text style={styles.continueTitle} numberOfLines={2}>{item.book.title}</Text>
                      <Text style={styles.continueChapter} numberOfLines={1}>
                        {item.chapter ? `Chương ${item.chapter.number}: ${item.chapter.title}` : 'Chương gần nhất'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Pressable onPress={() => router.push('/kham-pha')} style={styles.discoveryInvite}>
                <View style={styles.discoveryIcon}><Ionicons name="compass-outline" size={26} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.discoveryTitle}>Chưa có lịch sử đọc</Text>
                  <Text style={styles.discoveryText}>Khám phá kho truyện và bắt đầu cuốn sách đầu tiên.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            )}

            <SectionHeader title="Truyện nổi bật" action="Xem tất cả" onPress={() => router.push('/noi-bat')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(featured.length ? featured : books.slice(0, 6)).map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book)} />)}
            </ScrollView>

            <SectionHeader title="Sách mới cập nhật" action="Xem tất cả" onPress={() => router.push('/sach-moi')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {newest.map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book)} />)}
            </ScrollView>

            {recommendations.length ? (
              <>
                <SectionHeader
                  title="Có thể bạn sẽ thích"
                  subtitle={readCategories.size ? `Dựa trên ${[...readCategories].slice(0, 2).join(', ')}` : 'Lựa chọn phổ biến cho bạn'}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recommendations.map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book)} />)}
                </ScrollView>
              </>
            ) : null}

            {latestArticles.length ? (
              <>
                <SectionHeader title="Bài viết mới nhất" action="Xem tất cả" onPress={() => router.push('/tin-tuc')} />
                {latestArticles.map((article) => (
                  <Pressable key={article.id} onPress={() => router.push({ pathname: '/tin-tuc', params: { id: article.id } })} style={styles.article}>
                    <Image source={{ uri: article.image }} style={styles.articleImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.articleCategory}>{article.category}</Text>
                      <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                      <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
      <BottomNav router={router} active="home" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  eyebrow: { ...typography.caption, color: colors.primary, fontWeight: '900', letterSpacing: 1 },
  greeting: { ...typography.heading, color: colors.text, marginTop: spacing.xs },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  searchPrompt: { height: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.round, backgroundColor: colors.surface2 },
  searchPromptText: { ...typography.body, color: colors.outline, flex: 1 },
  loadingBlock: { gap: spacing.md, marginTop: spacing.xxl },
  carousel: { marginTop: spacing.xl, borderRadius: radius.xl },
  hero: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,11,21,0.28)' },
  heroText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.xl, backgroundColor: 'rgba(7,11,21,0.78)' },
  heroLabel: { ...typography.caption, color: colors.tertiary, fontWeight: '900' },
  heroTitle: { ...typography.heading, color: colors.white, marginTop: spacing.xs },
  heroMeta: { ...typography.body, color: colors.primary, marginTop: spacing.xs },
  dots: { flexDirection: 'row', alignSelf: 'center', gap: spacing.xs, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface3 },
  dotActive: { width: 20, backgroundColor: colors.primary },
  continueCard: { width: 300, minHeight: 142, flexDirection: 'row', borderRadius: radius.lg, padding: spacing.md, marginRight: spacing.md, backgroundColor: colors.surface },
  continueCover: { width: 78, height: 112, borderRadius: radius.sm },
  continueInfo: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  continueTitle: { ...typography.title, color: colors.text },
  continueChapter: { ...typography.caption, color: colors.muted, marginTop: spacing.sm },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surface3, overflow: 'hidden', marginTop: spacing.lg },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.tertiary },
  progressText: { ...typography.caption, color: colors.tertiary, fontWeight: '700', marginTop: spacing.xs },
  discoveryInvite: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg },
  discoveryIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3 },
  discoveryTitle: { ...typography.title, color: colors.text },
  discoveryText: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  article: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md },
  articleImage: { width: 100, height: 100, borderRadius: radius.md },
  articleCategory: { ...typography.caption, color: colors.tertiary, fontWeight: '800' },
  articleTitle: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  articleSummary: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
});
