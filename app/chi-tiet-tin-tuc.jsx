import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, ErrorState, LoadingSkeleton, Screen, StatusBadge } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getArticleById, getArticles, getCurrentUser, getFavoriteArticleIds, toggleFavoriteArticle } from '../services/localDataService';

function toParagraphs(article) {
  const raw = [article.summary, ...(String(article.content || '').split(/\n\s*\n/))].filter(Boolean);
  if (raw.length > 2) return raw;
  const sentences = String(article.content || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 2) return [article.summary, sentences.slice(0, 2).join(' '), sentences.slice(2).join(' ')].filter(Boolean);
  return raw;
}

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [user, setUser] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [current, all, currentUser] = await Promise.all([getArticleById(id), getArticles(), getCurrentUser()]);
    setArticle(current?.status === 'hidden' || current?.status === 'draft' ? null : current);
    setRelated(current ? all
      .filter((item) => item.id !== current.id && item.status === 'published')
      .sort((a, b) => Number(b.category === current.category) - Number(a.category === current.category))
      .slice(0, 3) : []);
    setUser(currentUser);
    const ids = currentUser ? await getFavoriteArticleIds(currentUser.id) : [];
    setFavorite(ids.includes(String(id)));
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const paragraphs = useMemo(() => article ? toParagraphs(article) : [], [article]);

  const shareArticle = () => Share.share({
    title: article.title,
    message: `${article.title}\n\n${article.summary}\n\nMika Books: mikabooks://article/${article.id}`,
  });

  const toggleFavorite = async () => {
    if (!user) return;
    setFavorite(await toggleFavoriteArticle(user.id, article.id));
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) return <Screen><LoadingSkeleton height={280} style={{ marginTop: spacing.xxl }} /><LoadingSkeleton height={180} style={{ marginTop: spacing.xl }} /></Screen>;
  if (!article) return <Screen><ErrorState title="Bài viết không tồn tại" message="Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng." onRetry={() => router.replace('/tin-tuc')} /></Screen>;

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Chi tiết tin tức" onBack={() => router.back()} rightIcon="share-social-outline" onRight={shareArticle} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <Image source={{ uri: article.image }} style={styles.hero} />
        <View style={styles.metaRow}>
          <StatusBadge status="success" label={article.category} />
          <Pressable onPress={toggleFavorite} style={styles.saveButton}>
            <Ionicons name={favorite ? 'bookmark' : 'bookmark-outline'} size={20} color={colors.primary} />
            <Text style={styles.saveText}>{favorite ? 'Đã lưu' : 'Lưu bài'}</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.byline}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(article.author || 'M').charAt(0)}</Text></View>
          <View><Text style={styles.author}>{article.author || 'Ban biên tập Mika'}</Text><Text style={styles.date}>{formatDisplayDate(article.publishedAt)} · 5 phút đọc</Text></View>
        </View>
        <View style={styles.articleBody}>
          {paragraphs.map((paragraph, index) => <Text key={`${index}-${paragraph.slice(0, 12)}`} style={[styles.paragraph, index === 0 && styles.lead]}>{paragraph}</Text>)}
        </View>
        <Pressable onPress={shareArticle} style={styles.shareCallout}><Ionicons name="share-social" size={22} color={colors.primary} /><Text style={styles.shareText}>Chia sẻ bài viết này</Text></Pressable>

        {related.length ? <><Text style={styles.relatedTitle}>Bài viết liên quan</Text>{related.map((item) => (
          <Card key={item.id} onPress={() => router.push({ pathname: '/chi-tiet-tin-tuc', params: { id: item.id } })} style={styles.relatedCard}>
            <Image source={{ uri: item.image }} style={styles.relatedImage} />
            <View style={{ flex: 1 }}><Text style={styles.relatedCategory}>{item.category}</Text><Text style={styles.relatedName} numberOfLines={2}>{item.title}</Text></View>
          </Card>
        ))}</> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl },
  hero: { width: '100%', height: 270, backgroundColor: colors.surface3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: spacing.xl, marginBottom: 0 },
  saveButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  saveText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  title: { ...typography.display, color: colors.text, marginHorizontal: spacing.xl, marginTop: spacing.lg },
  byline: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, margin: spacing.xl },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '900' },
  author: { ...typography.body, color: colors.text, fontWeight: '800' },
  date: { ...typography.caption, color: colors.outline },
  articleBody: { marginHorizontal: spacing.xl },
  paragraph: { ...typography.body, color: colors.muted, marginBottom: spacing.lg, fontSize: 16, lineHeight: 27 },
  lead: { color: colors.text, fontWeight: '600' },
  shareCallout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary },
  shareText: { ...typography.body, color: colors.primary, fontWeight: '800' },
  relatedTitle: { ...typography.heading, color: colors.text, margin: spacing.xl, marginBottom: spacing.md },
  relatedCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  relatedImage: { width: 88, height: 72, borderRadius: radius.md, backgroundColor: colors.surface3 },
  relatedCategory: { ...typography.caption, color: colors.tertiary },
  relatedName: { ...typography.body, color: colors.text, fontWeight: '800', marginTop: spacing.xs },
});
