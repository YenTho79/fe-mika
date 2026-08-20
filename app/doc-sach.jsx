import { useTheme } from '../hooks/useTheme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  BottomSheet,
  ChapterListItem,
  ConfirmDialog,
  FilterChip,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '../components/UI';
import { readerThemes, radius, spacing, typography } from '../constants/theme';
import {
  getBookById,
  getAppSettings,
  getChapters,
  getCurrentUser,
  getPurchasedChapterIds,
  getReaderSettings,
  getReadingProgress,
  purchaseChapter,
  saveReaderSettings,
  saveReadingProgress,
  getChapterById,
} from '../services/localDataService';

const fontOptions = [
  { value: 'System', label: 'Mặc định' },
  { value: 'serif', label: 'Có chân' },
  { value: 'monospace', label: 'Đơn cách' },
];
const lineHeightOptions = [
  { value: 1.45, label: 'Gọn' },
  { value: 1.7, label: 'Vừa' },
  { value: 2.0, label: 'Rộng' },
];

export default function Reader() {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.bookId || 'b1';

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState(null);
  const [user, setUser] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [progress, setProgress] = useState(null);

  const [settings, setSettings] = useState({
    fontSize: 18,
    theme: 'dark',
    fontFamily: 'System',
    lineHeight: 1.7,
    textAlign: 'justify',
  });
  const [appSettings, setAppSettings] = useState({ autoSaveProgress: true });

  const [controlsVisible, setControlsVisible] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingChapter, setPendingChapter] = useState(null);

  const [scrollState, setScrollState] = useState({ offset: 0, percent: 0 });
  const [atChapterEnd, setAtChapterEnd] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const scrollRef = useRef(null);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const restoredKeyRef = useRef('');
  const latestProgressRef = useRef({ user: null, chapter: null, scrollState: { offset: 0, percent: 0 }, autoSaveProgress: true });

  useEffect(() => {
    let active = true;

    Promise.all([
      getBookById(bookId),
      getChapters(bookId),
      getReaderSettings(),
      getAppSettings(),
      getCurrentUser(),
      getReadingProgress(),
    ]).then(([b, chs, rSet, aSet, currentUser, allProgress]) => {
      if (!active) return;
      setBook(b);
      setChapters(chs);
      setSettings(rSet);
      setAppSettings(aSet);
      setUser(currentUser);

      const userProg = currentUser ? allProgress.find((item) => item.userId === currentUser.id && item.bookId === bookId) : null;
      setProgress(userProg);

      const targetId = params.chapter || (userProg ? userProg.chapterId : chs[0]?.id);
      setChapterId(targetId);

      if (currentUser) {
        getPurchasedChapterIds(currentUser.id).then((ids) => {
          if (active) setPurchasedIds(ids);
        });
      }
    });

    return () => { active = false; };
  }, [bookId, params.chapter]);

  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!chapterId) return;

    let active = true;
    setLoadingContent(true);
    getChapterById(chapterId)
      .then((detail) => {
        if (!active || !detail) return;
        setChapters((prevChapters) => {
          const exists = prevChapters.some((c) => String(c.id) === String(chapterId));
          if (exists) {
            return prevChapters.map((c) =>
              String(c.id) === String(chapterId) ? { ...c, content: detail.content } : c
            );
          } else {
            return [...prevChapters, detail].sort((a, b) => Number(a.number) - Number(b.number));
          }
        });
      })
      .catch((err) => console.error('Lỗi tải chi tiết chương:', err))
      .finally(() => {
        if (active) setLoadingContent(false);
      });

    return () => { active = false; };
  }, [chapterId]);

  const currentIndex = chapters.findIndex((item) => String(item.id) === String(chapterId));
  const chapter = chapters[currentIndex] || null;
  const nextChapter = chapters[currentIndex + 1] || null;

  // Sync reader theme with global app theme unless explicitly customized
  const activeThemeKey = settings.explicitTheme
    ? settings.theme
    : (isDark ? 'dark' : 'light');
  const theme = readerThemes[activeThemeKey] || (isDark ? readerThemes.dark : readerThemes.light);

  useEffect(() => {
    latestProgressRef.current = { user, chapter, scrollState, autoSaveProgress: appSettings.autoSaveProgress };
  }, [appSettings.autoSaveProgress, chapter, scrollState, user]);

  useEffect(() => () => {
    const latest = latestProgressRef.current;
    if (!latest?.user || !latest.chapter || !latest.autoSaveProgress) return;
    saveReadingProgress({
      userId: latest.user.id,
      bookId,
      chapterId: latest.chapter.id,
      page: Math.max(0, Math.round(latest.scrollState.offset)),
      percent: latest.scrollState.percent,
    });
  }, [bookId]);

  useEffect(() => {
    if (!chapter) return;
    setScrollState({ offset: 0, percent: 0 });
    setAtChapterEnd(false);
    setBookmarked(false);
  }, [chapter?.id]);

  const persistProgress = useCallback(async (state = scrollState, force = false) => {
    if (!user || !chapter) return null;
    if (!force && !appSettings.autoSaveProgress) return null;
    const item = {
      userId: user.id,
      bookId,
      chapterId: chapter.id,
      page: Math.max(0, Math.round(state.offset)),
      percent: state.percent,
    };
    setProgress(item);
    return saveReadingProgress(item);
  }, [appSettings.autoSaveProgress, bookId, chapter, scrollState, user]);

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch, explicitTheme: true };
    setSettings(next);
    saveReaderSettings(next);
  };

  const requestChapter = (target) => {
    if (!target) return;
    const isUnlocked = target.price === 0 || user?.isVip || purchasedIds.includes(String(target.id));
    if (isUnlocked) {
      setChapterId(target.id);
      return;
    }
    setPendingChapter(target);
  };

  const handlePurchase = async () => {
    if (!pendingChapter || !user) return;
    const res = await purchaseChapter(user.id, pendingChapter.id, pendingChapter.price);
    if (res.success) {
      setPurchasedIds((prev) => [...prev, String(pendingChapter.id)]);
      setUser(res.user);
      setChapterId(pendingChapter.id);
      setPendingChapter(null);
    } else {
      Alert.alert('Thất bại', res.message || 'Không thể mua chương.');
    }
  };

  const onScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    const contentH = e.nativeEvent.contentSize.height;
    const layoutH = e.nativeEvent.layoutMeasurement.height;

    const maxScroll = contentH - layoutH;
    const percent = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((offset / maxScroll) * 100))) : 100;

    setScrollState({ offset, percent });

    if (maxScroll <= 0 || offset >= maxScroll - 40) {
      setAtChapterEnd(true);
    }
  };

  const restorePosition = () => {
    if (!chapter || String(progress?.chapterId) !== String(chapter.id)) return;
    const restoreKey = `${chapter.id}:${progress.page || 0}`;
    if (restoredKeyRef.current === restoreKey) return;
    restoredKeyRef.current = restoreKey;
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Number(progress.page || 0), animated: false }));
  };

  const syncShortChapterProgress = () => {
    if (!viewportHeightRef.current || !contentHeightRef.current) return;
    if (contentHeightRef.current <= viewportHeightRef.current + 1) {
      setScrollState({ offset: 0, percent: 100 });
      setAtChapterEnd(true);
    }
  };

  const saveBookmark = async () => {
    await persistProgress(scrollState, true);
    setBookmarked(true);
  };

  const contentParagraphs = useMemo(
    () => (chapter?.content || '').split(/\n\s*\n/).filter(Boolean),
    [chapter?.content]
  );

  return (
    <Screen padded={false} safeAreaTop={false} style={{ backgroundColor: theme.background }}>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        onLayout={({ nativeEvent }) => {
          viewportHeightRef.current = nativeEvent.layout.height;
          syncShortChapterProgress();
        }}
        onMomentumScrollEnd={() => persistProgress()}
        onContentSizeChange={(_, height) => {
          contentHeightRef.current = height;
          restorePosition();
          syncShortChapterProgress();
        }}
        scrollEventThrottle={32}
        contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
        onTouchEnd={() => setControlsVisible((current) => !current)}
      >
        {loadingContent && (!chapter || !chapter.content) ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
        ) : chapter ? (
          <>
            <Text style={[styles.chapterNumber, { color: theme.text }]}>CHƯƠNG {chapter.number}</Text>
            <Text style={[styles.chapterTitle, { color: theme.text }]}>{chapter.title}</Text>
            {contentParagraphs.map((paragraph, index) => (
              <Text
                key={`${chapter.id}-${index}`}
                style={[
                  styles.body,
                  {
                    color: theme.text,
                    fontSize: settings.fontSize,
                    lineHeight: settings.fontSize * settings.lineHeight,
                    fontFamily: settings.fontFamily,
                    textAlign: settings.textAlign,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
            {atChapterEnd ? (
              <View style={[styles.nextSuggestion, { backgroundColor: theme.surface }]}>
                <Ionicons name="checkmark-circle" size={30} color={colors.tertiary} />
                <Text style={[styles.nextTitle, { color: theme.text }]}>Bạn đã đọc hết chương {chapter.number}</Text>
                {nextChapter ? (
                  <PrimaryButton title={`Đọc chương ${nextChapter.number}`} onPress={() => requestChapter(nextChapter)} />
                ) : (
                  <Text style={[styles.endText, { color: theme.text }]}>Bạn đã đọc hết truyện. Tuyệt vời!</Text>
                )}
              </View>
            ) : null}
            <View style={styles.navigation}>
              <SecondaryButton title="Chương trước" icon="chevron-back" disabled={currentIndex <= 0} onPress={() => requestChapter(chapters[currentIndex - 1])} style={{ flex: 1 }} />
              <SecondaryButton title="Chương sau" icon="chevron-forward" disabled={!nextChapter} onPress={() => requestChapter(nextChapter)} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { color: theme.text }]}>Truyện chưa có nội dung chương.</Text>
        )}
      </ScrollView>

      {controlsVisible ? (
        <>
          <View style={styles.topControls}>
            <AppHeader
              title={book?.title || 'Đang tải...'}
              subtitle={chapter ? `Chương ${chapter.number}: ${chapter.title}` : ''}
              onBack={() => router.back()}
              rightIcon="options-outline"
              onRight={() => setShowSettings(true)}
            />
          </View>
          <View style={[styles.bottomControls, { backgroundColor: theme.surface, borderColor: theme.outline || colors.borderLight }]}>
            <View style={[styles.readerProgressTrack, { backgroundColor: theme.outline || colors.borderLight }]}>
              <View style={[styles.readerProgressFill, { width: `${scrollState.percent}%` }]} />
            </View>
            <Pressable onPress={() => setShowChapters(true)} style={styles.controlButton}>
              <Ionicons name="list" size={22} color={theme.text} />
              <Text style={[styles.controlText, { color: theme.text }]}>Chương</Text>
            </Pressable>
            <Text style={[styles.percentText, { color: theme.text }]}>{scrollState.percent}%</Text>
            <Pressable onPress={saveBookmark} style={styles.controlButton}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={bookmarked ? colors.tertiary : theme.text} />
              <Text style={[styles.controlText, { color: theme.text }]}>Lưu dấu</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <BottomSheet visible={showChapters} onClose={() => setShowChapters(false)} title="Danh sách chương">
        <ScrollView style={styles.chapterSheet}>
          {chapters.map((item) => (
            <ChapterListItem
              key={item.id}
              chapter={item}
              isCurrent={String(item.id) === String(chapterId)}
              isUnlocked={user?.isVip || purchasedIds.includes(String(item.id))}
              onPress={() => requestChapter(item)}
            />
          ))}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={showSettings} onClose={() => setShowSettings(false)} title="Cài đặt trình đọc">
        <Text style={styles.settingLabel}>Cỡ chữ</Text>
        <View style={styles.fontSizeRow}>
          <Pressable onPress={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 2) })} style={styles.roundButton}><Text style={styles.roundText}>A−</Text></Pressable>
          <Text style={styles.fontValue}>{settings.fontSize}px</Text>
          <Pressable onPress={() => updateSettings({ fontSize: Math.min(30, settings.fontSize + 2) })} style={styles.roundButton}><Text style={styles.roundText}>A+</Text></Pressable>
        </View>
        <Text style={styles.settingLabel}>Giao diện</Text>
        <View style={styles.row}>
          {Object.entries(readerThemes).map(([key, value]) => <FilterChip key={key} label={value.name} active={activeThemeKey === key} onPress={() => updateSettings({ theme: key })} />)}
        </View>
        <Text style={styles.settingLabel}>Phông chữ</Text>
        <View style={styles.row}>
          {fontOptions.map((item) => <FilterChip key={item.value} label={item.label} active={settings.fontFamily === item.value} onPress={() => updateSettings({ fontFamily: item.value })} />)}
        </View>
        <Text style={styles.settingLabel}>Giãn dòng</Text>
        <View style={styles.row}>
          {lineHeightOptions.map((item) => <FilterChip key={item.value} label={item.label} active={settings.lineHeight === item.value} onPress={() => updateSettings({ lineHeight: item.value })} />)}
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={Boolean(pendingChapter)}
        title="Mở khóa chương?"
        message={pendingChapter ? `Dùng ${pendingChapter.price} xu để mở khóa "${pendingChapter.title}"?` : ''}
        confirmText="Mở khóa"
        onConfirm={handlePurchase}
        onCancel={() => setPendingChapter(null)}
      />
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingTop: 110, paddingBottom: 130 },
  chapterNumber: { ...typography.caption, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  chapterTitle: { ...typography.display, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxxl },
  body: { marginBottom: spacing.xl },
  empty: { ...typography.body, textAlign: 'center', marginTop: spacing.xxxl },
  navigation: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  nextSuggestion: { alignItems: 'center', gap: spacing.md, borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.xxl },
  nextTitle: { ...typography.title, textAlign: 'center' },
  endText: { ...typography.body, textAlign: 'center' },
  topControls: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bottomControls: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 68,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  readerProgressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  readerProgressFill: { height: '100%', backgroundColor: colors.tertiary },
  controlButton: { minWidth: 60, alignItems: 'center', gap: 2 },
  controlText: { ...typography.caption },
  percentText: { ...typography.body, fontWeight: '800' },
  chapterSheet: { maxHeight: 360 },
  settingLabel: { ...typography.body, color: colors.muted, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.xs },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.xs },
  roundButton: { width: 52, height: 42, borderRadius: 14, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  roundText: { ...typography.title, color: colors.primary },
  fontValue: { ...typography.title, color: colors.text, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.xs },
});
