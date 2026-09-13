import { useMemo, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav, EmptyState, ErrorState, LoadingSkeleton, Screen } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { useLocalBooks } from '../hooks/useLocalBooks';

const CATEGORY_ICONS = {
  'Viễn tưởng': 'planet-outline',
  'Phiêu lưu': 'map-outline',
  'Kiếm hiệp': 'flash-outline',
  'Huyền huyễn': 'sparkles-outline',
  'Đô thị': 'business-outline',
  'Trinh thám': 'search-outline',
  'Ngôn tình': 'heart-outline',
  'Lãng mạn': 'rose-outline',
  'Kinh dị': 'skull-outline',
  'Bí ẩn': 'eye-outline',
  'Lịch sử': 'hourglass-outline',
  'Tâm lý': 'people-outline',
  'Công nghệ': 'hardware-chip-outline',
};

export default function Explore() {
  const router = useRouter();
  const { books, loading, error, reload } = useLocalBooks();
  const categories = useMemo(() => {
    const counts = new Map();
    books.forEach((book) => (book.categories || [book.category]).filter(Boolean).forEach((category) => {
      counts.set(category, (counts.get(category) || 0) + 1);
    }));
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi'));
  }, [books]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>KHÁM PHÁ MIKA</Text>
            <Text style={styles.title}>Thể loại truyện</Text>
            <Text style={styles.subtitle}>Chọn không gian truyện bạn muốn bước vào hôm nay.</Text>
          </View>
          <Pressable onPress={() => router.push('/tim-kiem')} style={styles.searchButton}>
            <Ionicons name="search" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/noi-bat')} style={styles.featuredLink}>
          <View style={styles.featuredIcon}><Ionicons name="flame" size={25} color={colors.warning} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTitle}>Khám phá tất cả truyện</Text>
            <Text style={styles.featuredText}>Tìm và lọc toàn bộ kho sách Mika</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>

        {loading ? (
          <View style={styles.grid}>{[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} width="47%" height={142} />)}</View>
        ) : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && categories.length ? (
          <View style={styles.grid}>
            {categories.map((category, index) => (
              <Pressable
                key={category.name}
                onPress={() => router.push({ pathname: '/the-loai', params: { name: category.name } })}
                style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.75 }]}
              >
                <View style={[styles.iconCircle, index % 3 === 1 && styles.iconCircleGreen, index % 3 === 2 && styles.iconCircleOrange]}>
                  <Ionicons name={CATEGORY_ICONS[category.name] || 'book-outline'} size={27} color={index % 3 === 1 ? colors.tertiary : index % 3 === 2 ? colors.warning : colors.primary} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} truyện</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {!loading && !error && !categories.length ? <EmptyState title="Chưa có thể loại" message="Hãy khôi phục dữ liệu demo từ Trang chủ." /> : null}
      </ScrollView>
      <BottomNav router={router} active="featured" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eyebrow: { ...typography.caption, color: colors.primary, fontWeight: '900', letterSpacing: 1 },
  title: { ...typography.display, color: colors.text, marginTop: spacing.xs },
  subtitle: { ...typography.body, color: colors.muted, marginTop: spacing.sm, maxWidth: 520 },
  searchButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  featuredLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, marginVertical: spacing.xxl },
  featuredIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,183,77,0.12)', alignItems: 'center', justifyContent: 'center' },
  featuredTitle: { ...typography.title, color: colors.text },
  featuredText: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  categoryCard: { width: '47%', minHeight: 142, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  iconCircle: { width: 50, height: 50, borderRadius: 17, backgroundColor: 'rgba(210,187,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconCircleGreen: { backgroundColor: 'rgba(78,222,163,0.1)' },
  iconCircleOrange: { backgroundColor: 'rgba(255,183,77,0.1)' },
  categoryName: { ...typography.title, color: colors.text, marginTop: spacing.md },
  categoryCount: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
});
