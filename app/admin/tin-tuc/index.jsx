import { useTheme } from '../../../hooks/useTheme';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter, ConfirmDeleteModal } from '../../../components/AdminUI';
import { EmptyState, FilterChip, PrimaryButton, Screen, Toast } from '../../../components/UI';
import { radius, spacing, typography } from '../../../constants/theme';
import { deleteArticle, formatDisplayDate, getArticles } from '../../../services/localDataService';

function Action({ icon, label, danger, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return <Pressable onPress={onPress} style={[styles.action, danger && styles.danger]}><Ionicons name={icon} size={15} color={danger ? colors.danger : colors.primary} /><Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text></Pressable>; }

export default function ArticleManagement() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState('');
  const load = useCallback(async () => setArticles([...await getArticles()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return articles.filter((item) => (!needle || `${item.title} ${item.category}`.toLocaleLowerCase('vi-VN').includes(needle)) && (status === 'all' || item.status === status));
  }, [articles, query, status]);
  const remove = async () => { if (!pendingDelete) return; await deleteArticle(pendingDelete.id); setPendingDelete(null); setToast('Đã xóa bài viết.'); load(); };
  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Quản lý tin tức" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title={`${articles.length} bài viết`} description="Bài đã đăng xuất hiện ngay trong giao diện User." action={<PrimaryButton title="Viết bài" icon="add" onPress={() => router.push('/admin/tin-tuc/them')} style={{ minWidth: 110 }} />} />
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm tiêu đề hoặc thể loại...">
          {[['all', 'Tất cả'], ['published', 'Đã đăng'], ['draft', 'Bản nháp']].map(([value, label]) => <FilterChip key={value} label={label} active={status === value} onPress={() => setStatus(value)} />)}
        </AdminSearchFilter>
        {filtered.map((article) => <AdminListItem key={article.id} image={article.image} title={article.title} subtitle={article.summary} meta={`${article.category} · ${formatDisplayDate(article.publishedAt)}${article.featured ? ' · Nổi bật' : ''}`} status={article.status === 'published' ? 'active' : 'pending'} statusLabel={article.status === 'published' ? 'Đã đăng' : 'Bản nháp'}>
          {article.status === 'published' ? <Action icon="eye-outline" label="Xem" onPress={() => router.push({ pathname: '/chi-tiet-tin-tuc', params: { id: article.id } })} /> : null}
          <Action icon="create-outline" label="Sửa" onPress={() => router.push({ pathname: '/admin/tin-tuc/chinh-sua', params: { id: article.id } })} />
          <Action icon="trash-outline" label="Xóa" danger onPress={() => setPendingDelete(article)} />
        </AdminListItem>)}
        {!filtered.length ? <EmptyState icon="newspaper-outline" title="Chưa có bài viết phù hợp" actionTitle="Viết bài mới" onAction={() => router.push('/admin/tin-tuc/them')} /> : null}
      </ScrollView>
      <ConfirmDeleteModal visible={Boolean(pendingDelete)} title="Xóa bài viết?" message={`“${pendingDelete?.title || ''}” sẽ biến mất khỏi khu vực tin tức.`} confirmText="Xóa" onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}
const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.emptyCircleBg },
  danger: { backgroundColor: 'rgba(255,180,171,0.1)' },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
});
