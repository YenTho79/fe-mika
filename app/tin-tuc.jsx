import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, EmptyState, ErrorState, FilterChip, LoadingSkeleton, Screen, SearchField, StatusBadge } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getArticles, getCurrentUser, getFavoriteArticleIds, toggleFavoriteArticle } from '../services/localDataService';

export default function News() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [items, currentUser] = await Promise.all([getArticles(), getCurrentUser()]);
      const published = items
        .filter((item) => item.status !== 'draft' && item.status !== 'hidden')
        .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
      setArticles(published);
      setUser(currentUser);
      setFavoriteIds(currentUser ? await getFavoriteArticleIds(currentUser.id) : []);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải tin tức.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const categories = useMemo(() => ['Tất cả', ...new Set(articles.map((item) => item.category).filter(Boolean)), 'Đã lưu'], [articles]);
  const featured = articles.find((item) => item.featured) || articles[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    return articles.filter((item) => {
      const matchesCategory = category === 'Tất cả'
        || (category === 'Đã lưu' && favoriteIds.includes(String(item.id)))
        || item.category === category;
      return matchesCategory && (!normalized || item.title.toLocaleLowerCase('vi-VN').includes(normalized));
    });
  }, [articles, category, favoriteIds, query]);

  const toggleFavorite = async (article) => {
    if (!user) return;
    const isFavorite = await toggleFavoriteArticle(user.id, article.id);
    setFavoriteIds((current) => isFavorite
      ? [String(article.id), ...current]
      : current.filter((id) => String(id) !== String(article.id)));
  };

  const openArticle = (article) => router.push({ pathname: '/chi-tiet-tin-tuc', params: { id: article.id } });

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Tin tức Mika" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {loading ? <><LoadingSkeleton height={230} /><LoadingSkeleton height={48} style={{ marginTop: spacing.lg }} /><LoadingSkeleton height={190} style={{ marginTop: spacing.lg }} /></> : null}
        {!loading && error ? <ErrorState title="Không tải được tin tức" message={error} onRetry={load} /> : null}
        {!loading && !error && articles.length ? (
          <>
            <Pressable onPress={() => openArticle(featured)} style={styles.featured}>
              <Image source={{ uri: featured.image }} style={StyleSheet.absoluteFillObject} />
              <View style={styles.featuredShade} />
              <View style={styles.featuredBody}>
                <StatusBadge status="success" label={`Nổi bật · ${featured.category}`} />
                <Text style={styles.featuredTitle}>{featured.title}</Text>
                <Text style={styles.featuredSummary} numberOfLines={2}>{featured.summary}</Text>
              </View>
            </Pressable>

            <SearchField value={query} onChangeText={setQuery} placeholder="Tìm theo tiêu đề bài viết..." style={{ marginTop: spacing.xl }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {categories.map((item) => <FilterChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}
            </ScrollView>

            <Text style={styles.sectionTitle}>{category === 'Đã lưu' ? 'Bài viết đã lưu' : 'Mới nhất'}</Text>
            {filtered.map((article) => (
              <Card key={article.id} style={styles.card} onPress={() => openArticle(article)}>
                <Image source={{ uri: article.image }} style={styles.image} />
                <View style={styles.body}>
                  <View style={styles.metaRow}>
                    <Text style={styles.category}>{article.category}</Text>
                    <Pressable onPress={(event) => { event.stopPropagation?.(); toggleFavorite(article); }} hitSlop={10}>
                      <Ionicons name={favoriteIds.includes(String(article.id)) ? 'bookmark' : 'bookmark-outline'} size={21} color={colors.primary} />
                    </Pressable>
                  </View>
                  <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
                  <Text style={styles.date}>{formatDisplayDate(article.publishedAt)} · 5 phút đọc</Text>
                </View>
              </Card>
            ))}
            {!filtered.length ? <EmptyState icon="search-outline" title="Không có bài viết phù hợp" message="Thử đổi từ khóa hoặc bộ lọc." /> : null}
          </>
        ) : null}
        {!loading && !error && articles.length === 0 ? <EmptyState icon="newspaper-outline" title="Chưa có tin tức" /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  featured: { height: 240, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface3 },
  featuredShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,10,24,0.52)' },
  featuredBody: { padding: spacing.xl },
  featuredTitle: { ...typography.heading, color: colors.white, marginTop: spacing.md },
  featuredSummary: { ...typography.body, color: '#e8e7ed', marginTop: spacing.sm },
  filters: { gap: spacing.sm, paddingVertical: spacing.lg },
  sectionTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.md },
  card: { padding: 0, overflow: 'hidden', marginBottom: spacing.lg, flexDirection: 'row' },
  image: { width: 118, minHeight: 154, backgroundColor: colors.surface3 },
  body: { padding: spacing.md, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  category: { ...typography.caption, color: colors.tertiary, fontWeight: '800' },
  date: { ...typography.caption, color: colors.outline, marginTop: spacing.sm },
  title: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  summary: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
});
