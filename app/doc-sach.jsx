import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, readerThemes, radius, spacing, typography } from '../constants/theme';
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
} from '../services/localDataService';

const fontOptions = [
  { value: 'System', label: 'Mặc định' },
  { value: 'serif', label: 'Có chân' },
  { value: 'monospace', label: 'Đơn cách' },
];
const lineHeightOptions = [
  { value: 1.45, label: 'Gọn' },
  { value: 1.7, label: 'Vừa' },
  { value: 2, label: 'Thoáng' },
];

export default function Reader() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.bookId || 'b1';
  const scrollRef = useRef(null);
  const restoredKeyRef = useRef('');
  const latestProgressRef = useRef(null);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [user, setUser] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [chapterId, setChapterId] = useState(null);
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
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [pendingChapter, setPendingChapter] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [scrollState, setScrollState] = useState({ offset: 0, percent: 0 });
  const [bookmarked, setBookmarked] = useState(false);
  const [atChapterEnd, setAtChapterEnd] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getBookById(bookId),
      getChapters(bookId),
      getReaderSettings(),
      getCurrentUser(),
      getAppSettings(),
    ]).then(async ([nextBook, nextChapters, nextSettings, currentUser, nextAppSettings]) => {
      const [nextProgress, nextPurchasedIds] = currentUser
        ? await Promise.all([
          getReadingProgress(currentUser.id, bookId),
          getPurchasedChapterIds(currentUser.id),
        ])
        : [null, []];
      if (!active) return;
      setBook(nextBook);
      setChapters(nextChapters);
      setSettings(nextSettings);
      setAppSettings(nextAppSettings);
      setUser(currentUser);
      setProgress(nextProgress);
      setPurchasedIds(nextPurchasedIds);

      const requested = nextChapters.find((item) => String(item.id) === String(params.chapter));
      const recent = nextChapters.find((item) => String(item.id) === String(nextProgress?.chapterId));
      const target = requested || recent || nextChapters[0] || null;
      if (target?.locked && !nextPurchasedIds.includes(String(target.id))) {
        setPendingChapter(target);
        const fallback = recent && (!recent.locked || nextPurchasedIds.includes(String(recent.id)))
          ? recent
          : nextChapters.find((item) => !item.locked || nextPurchasedIds.includes(String(item.id)));
        setChapterId(fallback?.id || null);
      } else {
        setChapterId(target?.id || null);
      }
    }).catch((error) => console.error('Không thể mở trình đọc:', error));
    return () => { active = false; };
  }, [bookId, params.chapter]);

  const currentIndex = chapters.findIndex((item) => String(item.id) === String(chapterId));
  const chapter = chapters[currentIndex] || null;
  const nextChapter = chapters[currentIndex + 1] || null;
  const theme = readerThemes[settings.theme] || readerThemes.dark;

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
    const saved = await saveReadingProgress({
      userId: user.id,
      bookId,
      chapterId: chapter.id,
      page: Math.max(0, Math.round(state.offset)),
      percent: state.percent,
    });
    setProgress(saved);
    return saved;
  }, [appSettings.autoSaveProgress, bookId, chapter, scrollState, user]);

  const updateSettings = useCallback((patch) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveReaderSettings(next);
      return next;
    });
  }, []);

  const requestChapter = (target) => {
    if (!target) return;
    if (target.locked && !purchasedIds.includes(String(target.id))) {
      setShowChapters(false);
      setPendingChapter(target);
      return;
    }
    persistProgress();
    restoredKeyRef.current = '';
    setChapterId(target.id);
    setShowChapters(false);
  };

  const unlockChapter = async () => {
    if (!pendingChapter || !user) return;
    setUnlocking(true);
    const result = await purchaseChapter(user.id, pendingChapter);
    setUnlocking(false);
    if (!result.success && result.code === 'INSUFFICIENT_COINS') {
      setPendingChapter(null);
      router.push({ pathname: '/nap-xu', params: { returnBookId: bookId, returnChapterId: pendingChapter.id } });
      return;
    }
    if (result.success) {
      setPurchasedIds((current) => [...new Set([...current, String(pendingChapter.id)])]);
      setUser((current) => current ? { ...current, coinBalance: result.balance ?? current.coinBalance } : current);
      const target = pendingChapter;
      setPendingChapter(null);
      restoredKeyRef.current = '';
      setChapterId(target.id);
    }
  };

  const onScroll = ({ nativeEvent }) => {
    const offset = Math.max(0, nativeEvent.contentOffset.y);
    const viewport = nativeEvent.layoutMeasurement.height;
    const contentHeight = nativeEvent.contentSize.height;
    const scrollable = Math.max(1, contentHeight - viewport);
    const percent = contentHeight <= viewport + 1
      ? 100
      : Math.min(100, Math.max(0, Math.round((offset / scrollable) * 100)));
    setScrollState({ offset, percent });
    setAtChapterEnd(percent >= 98);
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
        {chapter ? (
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
          <View style={[styles.bottomControls, { backgroundColor: theme.surface }]}>
            <View style={[styles.readerProgressTrack, { backgroundColor: theme.outline }]}>
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
              isUnlocked={purchasedIds.includes(String(item.id))}
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
          {Object.entries(readerThemes).map(([key, value]) => <FilterChip key={key} label={value.name} active={settings.theme === key} onPress={() => updateSettings({ theme: key })} />)}
        </View>
        <Text style={styles.settingLabel}>Phông chữ</Text>
        <View style={styles.row}>
          {fontOptions.map((font) => <FilterChip key={font.value} label={font.label} active={settings.fontFamily === font.value} onPress={() => updateSettings({ fontFamily: font.value })} />)}
        </View>
        <Text style={styles.settingLabel}>Khoảng cách dòng</Text>
        <View style={styles.row}>
          {lineHeightOptions.map((option) => <FilterChip key={option.value} label={option.label} active={settings.lineHeight === option.value} onPress={() => updateSettings({ lineHeight: option.value })} />)}
        </View>
        <Text style={styles.settingLabel}>Căn lề</Text>
        <View style={styles.row}>
          <FilterChip label="Căn trái" active={settings.textAlign === 'left'} onPress={() => updateSettings({ textAlign: 'left' })} />
          <FilterChip label="Căn đều" active={settings.textAlign === 'justify'} onPress={() => updateSettings({ textAlign: 'justify' })} />
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={Boolean(pendingChapter)}
        title={`Mở khóa chương ${pendingChapter?.number || ''}?`}
        message={`Chương này cần ${pendingChapter?.coinPrice || 0} xu. Số dư hiện tại của bạn là ${user?.coinBalance || 0} xu.`}
        confirmText={unlocking ? 'Đang mở...' : `Dùng ${pendingChapter?.coinPrice || 0} xu`}
        onConfirm={unlocking ? undefined : unlockChapter}
        onCancel={() => setPendingChapter(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  readerProgressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  readerProgressFill: { height: '100%', backgroundColor: colors.tertiary },
  controlButton: { minWidth: 60, alignItems: 'center', gap: 2 },
  controlText: { ...typography.caption },
  percentText: { ...typography.title },
  settingLabel: { ...typography.body, color: colors.muted, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.sm },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  roundButton: { width: 52, height: 42, borderRadius: 14, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  roundText: { ...typography.title, color: colors.primary },
  fontValue: { ...typography.title, color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chapterSheet: { maxHeight: 430 },
});
