import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  BookCard,
  BottomSheet,
  Button,
  Card,
  ChapterListItem,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingSkeleton,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatusBadge,
  TextField,
} from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import {
  addReview,
  deleteReview,
  formatDisplayDate,
  getBookById,
  getBookSaveCount,
  getBooks,
  getChapters,
  getCurrentUser,
  getPurchasedChapterIds,
  getReadingProgress,
  getReviews,
  isBookSaved,
  toggleSaveBook,
  updateReview,
} from '../services/localDataService';


export default function BookDetail() {
  const router = useRouter();
  const { id = 'b1' } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [saveCount, setSaveCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('Tổng quan');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextBook, nextChapters, nextReviews, currentUser, allBooks, nextSaveCount] = await Promise.all([
        getBookById(id),
        getChapters(id),
        getReviews(id),
        getCurrentUser(),
        getBooks(),
        getBookSaveCount(id),
      ]);
      if (!nextBook) throw new Error('Không tìm thấy truyện.');
      const categorySet = new Set(nextBook.categories || [nextBook.category]);
      setBook(nextBook);
      setChapters(nextChapters);
      setReviews(nextReviews);
      setUser(currentUser);
      setSaveCount(nextSaveCount);
      setRelatedBooks(allBooks.filter((item) => (
        String(item.id) !== String(id)
        && (item.categories || [item.category]).some((category) => categorySet.has(category))
      )).slice(0, 6));
      if (currentUser) {
        const [nextSaved, nextProgress, nextPurchasedIds] = await Promise.all([
          isBookSaved(currentUser.id, id),
          getReadingProgress(currentUser.id, id),
          getPurchasedChapterIds(currentUser.id),
        ]);
        setSaved(nextSaved);
        setProgress(nextProgress);
        setPurchasedIds(nextPurchasedIds);
      }
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải chi tiết truyện.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const visibleReviews = useMemo(
    () => reviews.filter((item) => !item.status || item.status === 'approved'),
    [reviews]
  );

  const averageRating = useMemo(() => {
    if (!visibleReviews.length) return '0.0';
    return (visibleReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / visibleReviews.length).toFixed(1);
  }, [visibleReviews]);


  const handleSave = async () => {
    if (!user) return;
    const nextSaved = await toggleSaveBook(user.id, book.id);
    setSaved(nextSaved);
    setSaveCount((current) => Math.max(0, current + (nextSaved ? 1 : -1)));
  };

  const openChapter = (chapter) => {
    router.push({ pathname: '/doc-sach', params: { bookId: book.id, chapter: chapter.id } });
  };

  const continueReading = () => {
    const chapter = chapters.find((item) => String(item.id) === String(progress?.chapterId)) || chapters[0];
    if (chapter) openChapter(chapter);
  };

  const submitReview = async () => {
    const content = comment.trim();
    if (content.length < 3) {
      setValidationError('Nội dung đánh giá phải có ít nhất 3 ký tự.');
      return;
    }
    if (content.length > 500) {
      setValidationError('Nội dung đánh giá không được vượt quá 500 ký tự.');
      return;
    }
    if (!user) return;

    if (editingReview) {
      const updated = await updateReview(editingReview.id, { rating, content }, user.token);
      if (updated) setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));

    } else {
      const created = await addReview({
        bookId: book.id,
        rating,
        content,
      }, user.token);
      if (created) setReviews((current) => [created, ...current]);
    }
    setComment('');
    setRating(5);
    setEditingReview(null);
    setValidationError('');
    setShowReview(false);
  };

  const openNewReview = () => {
    setEditingReview(null);
    setRating(5);
    setComment('');
    setValidationError('');
    setShowReview(true);
  };

  const openEditReview = (review) => {
    setEditingReview(review);
    setRating(Number(review.rating) || 5);
    setComment(review.content || '');
    setValidationError('');
    setShowReview(true);
  };

  const confirmReviewAction = async () => {
    if (!reviewAction) return;
    if (reviewAction.type === 'toggle') {
      const next = reviewAction.review.status === 'hidden' ? 'approved' : 'hidden';
      const updated = await updateReview(reviewAction.review.id, { status: next });
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } else {
      await deleteReview(reviewAction.review.id);
      setReviews((current) => current.filter((item) => item.id !== reviewAction.review.id));
    }
    setReviewAction(null);
  };

  if (loading) {
    return <Screen><LoadingSkeleton height={250} borderRadius={radius.xl} style={{ marginTop: spacing.xl }} /><LoadingSkeleton height={160} style={{ marginTop: spacing.xl }} /></Screen>;
  }
  if (error || !book) {
    return <Screen><ErrorState title="Không mở được truyện" message={error} onRetry={load} /></Screen>;
  }

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader
        title="Chi tiết truyện"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/trang-chu')}
        rightIcon="share-social-outline"
        onRight={() => router.push({ pathname: '/chia-se', params: { bookId: book.id } })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.heroBackdrop}>
          <Image source={{ uri: book.cover }} style={styles.backdropImage} blurRadius={18} />
          <View style={styles.backdropShade} />
          <View style={styles.hero}>
            <Image source={{ uri: book.cover }} style={styles.cover} />
            <View style={styles.heroInfo}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.rating}>{averageRating}</Text>
                <StatusBadge status={book.status} style={{ marginLeft: spacing.xs }} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={chapters.length} label="Chương" />
          <Stat value={book.views || 0} label="Lượt đọc" />
          <Stat value={saveCount} label="Lượt lưu" />
        </View>

        <View style={styles.actions}>
          <Button
            title={progress ? 'Đọc tiếp' : 'Đọc ngay'}
            icon={progress ? 'play-outline' : 'book-outline'}
            onPress={continueReading}
            disabled={!chapters.length}
            style={{ flex: 1 }}
          />
          <Button
            title={saved ? 'Bỏ lưu' : 'Lưu'}
            variant="outline"
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            onPress={handleSave}
            style={{ flex: 1 }}
          />
        </View>
        {progress ? (() => {
          const lastChapter = chapters.find((c) => String(c.id) === String(progress.chapterId));
          return lastChapter ? (
            <View style={styles.lastReadWrap}>
              <Ionicons name="book-outline" size={14} color={colors.tertiary} />
              <Text style={styles.lastReadText}>Lần cuối đọc: Chương {lastChapter.number}</Text>
            </View>
          ) : null;
        })() : null}

        <View style={styles.tabs}>
          {['Tổng quan', 'Chương truyện'].map((item) => <FilterChip key={item} label={item} active={tab === item} onPress={() => setTab(item)} />)}
        </View>

        {tab === 'Tổng quan' ? (
          <>
            <SectionHeader title="Nội dung" />
            <Text style={styles.description} numberOfLines={expanded ? undefined : 4}>{book.description}</Text>
            {book.description?.length > 130 ? (
              <Pressable onPress={() => setExpanded((current) => !current)}>
                <Text style={styles.moreText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
              </Pressable>
            ) : null}
            <SectionHeader title="Thể loại" />
            <View style={styles.categoryRow}>
              {(book.categories || [book.category]).map((item) => <FilterChip key={item} label={item} active />)}
            </View>
            <SectionHeader title="Đánh giá" action="Viết đánh giá" onPress={openNewReview} subtitle={`${visibleReviews.length} nhận xét`} />
            {visibleReviews.length ? visibleReviews.map((review) => (
              <Card key={review.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewer}>
                    <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{(review.userName || 'M').trim().charAt(0).toUpperCase()}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{review.userName || 'Độc giả Mika'}</Text>
                      <Text style={styles.reviewDate}>{formatDisplayDate(review.updatedAt || review.createdAt)}{review.updatedAt && review.createdAt && new Date(review.updatedAt) - new Date(review.createdAt) > 1000 ? ' · Đã sửa' : ''}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
                </View>
                <Text style={styles.reviewBody}>{review.content}</Text>
                {String(review.userId) === String(user?.id) || user?.role === 'admin' ? (
                  <View style={styles.reviewActions}>
                    {String(review.userId) === String(user?.id) ? (
                      <Pressable onPress={() => openEditReview(review)} style={styles.reviewAction}>
                        <Ionicons name="create-outline" size={17} color={colors.primary} />
                        <Text style={styles.reviewActionText}>Sửa</Text>
                      </Pressable>
                    ) : null}
                    {String(review.userId) === String(user?.id) ? (
                      <Pressable onPress={() => setReviewAction({ review, type: 'delete' })} style={styles.reviewAction}>
                        <Ionicons name="trash-outline" size={17} color={colors.danger} />
                        <Text style={[styles.reviewActionText, { color: colors.danger }]}>Xóa</Text>
                      </Pressable>
                    ) : null}
                    {user?.role === 'admin' && String(review.userId) !== String(user?.id) ? (
                      <Pressable onPress={() => setReviewAction({ review, type: 'toggle' })} style={styles.reviewAction}>
                        <Ionicons name={review.status === 'hidden' ? 'eye-outline' : 'eye-off-outline'} size={17} color={colors.warning} />
                        <Text style={[styles.reviewActionText, { color: colors.warning }]}>{review.status === 'hidden' ? 'Khôi phục' : 'Ẩn'}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </Card>
            )) : <EmptyState title="Chưa có đánh giá" message="Hãy là người đầu tiên chia sẻ cảm nhận." />}
            {relatedBooks.length ? (
              <>
                <SectionHeader title="Truyện liên quan" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {relatedBooks.map((item) => (
                    <BookCard
                      key={item.id}
                      book={item}
                      onPress={() => router.push({ pathname: '/chi-tiet', params: { id: item.id } })}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : (
          <>
            <SectionHeader title="Danh sách chương" subtitle={`${chapters.length} chương`} />
            {chapters.map((chapter) => (
              <ChapterListItem
                key={chapter.id}
                chapter={chapter}
                isCurrent={String(progress?.chapterId) === String(chapter.id)}
                isRead={progress && chapter.number < (chapters.find((item) => String(item.id) === String(progress.chapterId))?.number || 0)}
                isUnlocked={purchasedIds.includes(String(chapter.id))}
                onPress={() => openChapter(chapter)}
              />
            ))}
            {!chapters.length ? <EmptyState title="Chưa có chương" /> : null}
          </>
        )}
      </ScrollView>

      <BottomSheet visible={showReview} onClose={() => setShowReview(false)} title={editingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}>
        <Text style={styles.sheetLabel}>Mức độ hài lòng</Text>
        <View style={styles.starsInput}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={34} color={colors.warning} onPress={() => setRating(star)} />
          ))}
        </View>
        <TextField value={comment} onChangeText={setComment} label="Cảm nhận của bạn" error={validationError} multiline numberOfLines={4} maxLength={500} />
        <Text style={styles.characterCount}>{comment.length}/500</Text>
        <PrimaryButton title={editingReview ? 'Lưu thay đổi' : 'Gửi đánh giá'} onPress={submitReview} />
      </BottomSheet>
      <ConfirmDialog
        visible={Boolean(reviewAction)}
        title={reviewAction?.type === 'toggle' ? (reviewAction?.review?.status === 'hidden' ? 'Khôi phục đánh giá?' : 'Ẩn đánh giá này?') : 'Xóa đánh giá này?'}
        message={reviewAction?.type === 'toggle' ? (reviewAction?.review?.status === 'hidden' ? 'Đánh giá sẽ hiển thị lại với mọi người.' : 'Đánh giá sẽ bị ẩn khỏi trang chi tiết.') : 'Thao tác này không thể hoàn tác.'}
        confirmText={reviewAction?.type === 'toggle' ? (reviewAction?.review?.status === 'hidden' ? 'Khôi phục' : 'Ẩn') : 'Xóa'}
        onConfirm={confirmReviewAction}
        onCancel={() => setReviewAction(null)}
        isDanger
      />
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl },
  heroBackdrop: { height: 245, overflow: 'hidden', justifyContent: 'flex-end' },
  backdropImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.42 },
  backdropShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,19,38,0.68)' },
  hero: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg, padding: spacing.xl },
  cover: { width: 112, height: 166, borderRadius: radius.lg, backgroundColor: colors.surface },
  heroInfo: { flex: 1, paddingBottom: spacing.md },
  title: { ...typography.heading, color: colors.white },
  author: { ...typography.body, color: colors.primary, marginTop: spacing.xs, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  rating: { ...typography.body, color: colors.white, fontWeight: '800' },
  stats: { flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { ...typography.title, color: colors.text },
  statLabel: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.lg },
  lastReadWrap: { marginHorizontal: spacing.xl, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  lastReadText: { ...typography.caption, color: colors.tertiary, fontWeight: '700' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: spacing.xxl },
  description: { ...typography.body, color: colors.muted, marginHorizontal: spacing.xl },
  moreText: { ...typography.body, color: colors.primary, fontWeight: '800', marginHorizontal: spacing.xl, marginTop: spacing.xs },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginHorizontal: spacing.xl },
  review: { marginHorizontal: spacing.xl, marginBottom: spacing.md, padding: spacing.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  reviewer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryContainer },
  reviewAvatarText: { color: colors.white, fontWeight: '900' },
  reviewName: { ...typography.title, color: colors.text, flex: 1 },
  reviewStars: { color: colors.warning },
  reviewBody: { ...typography.body, color: colors.muted, marginTop: spacing.sm },
  reviewDate: { ...typography.caption, color: colors.outline, marginTop: spacing.sm },
  reviewActions: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'flex-end', marginTop: spacing.md },
  reviewAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  reviewActionText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  sheetLabel: { ...typography.body, color: colors.muted, fontWeight: '700' },
  starsInput: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  characterCount: { ...typography.caption, color: colors.outline, textAlign: 'right', marginTop: -spacing.md, marginBottom: spacing.md },
});
