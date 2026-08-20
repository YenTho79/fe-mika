import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminPageTitle } from '../../components/AdminUI';
import { Card, EmptyState, PrimaryButton, Screen, SectionHeader, StatCard, StatusBadge } from '../../components/UI';
import { useTheme } from '../../hooks/useTheme';
import { radius, spacing, typography } from '../../constants/theme';
import { formatDisplayDate, getAdminBooks, getAdminChapters, getCurrentUser, getReviews, getTransactions, getUsers } from '../../services/localDataService';

const parseViews = (value) => {
  const text = String(value || '0').toUpperCase();
  const number = parseFloat(text) || 0;
  return text.endsWith('M') ? number * 1000000 : text.endsWith('K') ? number * 1000 : number;
};

export default function AdminDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const [data, setData] = useState({ user: null, books: [], chapters: [], users: [], transactions: [], reviews: [] });
  const load = useCallback(async () => {
    const [user, books, chapters, users, transactions, reviews] = await Promise.all([
      getCurrentUser(), getAdminBooks(), getAdminChapters(), getUsers(), getTransactions(), getReviews(),
    ]);
    setData({ user, books, chapters, users, transactions, reviews });
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const topBooks = useMemo(() => [...data.books].sort((a, b) => parseViews(b.views) - parseViews(a.views)).slice(0, 5), [data.books]);
  const maxViews = Math.max(1, ...topBooks.map((item) => parseViews(item.views)));
  const recentBooks = useMemo(() => [...data.books].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, 3), [data.books]);
  const recentReviews = useMemo(() => [...data.reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3), [data.reviews]);
  const deposits = data.transactions.filter((item) => item.type === 'deposit' && item.status === 'success');
  const totalRevenue = deposits.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalCoins = deposits.reduce((sum, item) => sum + Number(item.coin || 0), 0);
  const recentTransactions = [...data.transactions].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 7);

  const quickActions = [
    ['Thêm truyện', 'book-outline', '/admin/truyen/them'],
    ['Thêm chương', 'document-text-outline', '/admin/chuong/them'],
    ['Viết bài', 'newspaper-outline', '/admin/tin-tuc/them'],
  ];
  const modules = [
    ['Truyện', 'library-outline', '/admin/truyen'], ['Người dùng', 'people-outline', '/admin/nguoi-dung'],
    ['Giao dịch', 'wallet-outline', '/admin/giao-dich'], ['Đánh giá', 'star-outline', '/admin/danh-gia'],
    ['Tin tức', 'newspaper-outline', '/admin/tin-tuc'], ['Cài đặt', 'settings-outline', '/admin/cai-dat'],
  ];

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Mika Admin" rightIcon="phone-portrait-outline" onRight={() => router.push('/trang-chu')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcome}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>TỔNG QUAN HÔM NAY</Text>
            <Text style={styles.title}>Xin chào, {data.user?.name || 'Quản trị viên'}</Text>
            <Text style={styles.subtitle}>Mọi thay đổi được lưu trực tiếp trên thiết bị này.</Text>
          </View>
          {data.user?.avatar ? <Image source={{ uri: data.user.avatar }} style={styles.avatar} /> : null}
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Tổng truyện" value={data.books.length} icon="library-outline" style={styles.stat} onPress={() => router.push('/admin/truyen')} />
          <StatCard title="Tổng chương" value={data.chapters.length} icon="documents-outline" color="#176b87" style={styles.stat} onPress={() => router.push('/admin/chuong')} />
          <StatCard title="Người dùng" value={data.users.length} icon="people-outline" color="#277143" style={styles.stat} onPress={() => router.push('/admin/nguoi-dung')} />
          <StatCard title="Giao dịch" value={data.transactions.length} icon="wallet-outline" color="#9a5b13" style={styles.stat} onPress={() => router.push('/admin/giao-dich')} />
        </View>
        <Card style={styles.revenue}>
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={styles.revenueLabel} numberOfLines={1} adjustsFontSizeToFit>TỔNG XU ĐÃ NẠP</Text><Text style={styles.revenueValue}>{totalCoins.toLocaleString('vi-VN')} xu</Text></View>
          <View style={styles.revenueDivider} />
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={styles.revenueLabel} numberOfLines={1} adjustsFontSizeToFit>DOANH THU MÔ PHỎNG</Text><Text style={styles.revenueValue}>{totalRevenue.toLocaleString('vi-VN')}đ</Text></View>
        </Card>

        <SectionHeader title="Thao tác nhanh" />
        <View style={styles.quickGrid}>{quickActions.map(([label, icon, route]) => (
          <Pressable key={label} onPress={() => router.push(route)} style={styles.quickItem}>
            <View style={styles.quickIcon}><Ionicons name={icon} size={23} color={colors.primary} /></View>
            <Text style={styles.quickLabel}>{label}</Text>
          </Pressable>
        ))}</View>

        <SectionHeader title="Lượt đọc theo truyện" subtitle="Top 5 từ dữ liệu local" />
        <Card>
          {topBooks.map((book) => (
            <View key={book.id} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{book.title}</Text>
              <View style={styles.track}><View style={[styles.bar, { width: `${Math.max(4, parseViews(book.views) / maxViews * 100)}%` }]} /></View>
              <Text style={styles.barValue}>{book.views || 0}</Text>
            </View>
          ))}
          {!topBooks.length ? <EmptyState title="Chưa có dữ liệu lượt đọc" /> : null}
        </Card>

        <SectionHeader title="Giao dịch gần đây" action="Xem tất cả" onPress={() => router.push('/admin/giao-dich')} />
        <Card>
          {recentTransactions.map((item) => (
            <View key={item.id} style={styles.transactionRow}>
              <View style={styles.smallIcon}><Ionicons name={item.type === 'deposit' ? 'arrow-down' : 'cart-outline'} size={17} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={styles.transactionTitle}>{item.id} · {item.coin || 0} xu</Text><Text style={styles.transactionMeta}>{formatDisplayDate(item.createdAt, true)}</Text></View>
              <StatusBadge status={item.status} />
            </View>
          ))}
          {!recentTransactions.length ? <EmptyState title="Chưa có giao dịch" /> : null}
        </Card>

        <SectionHeader title="Truyện thêm gần đây" action="Quản lý" onPress={() => router.push('/admin/truyen')} />
        {recentBooks.map((book) => <Card key={book.id} style={styles.bookRow} onPress={() => router.push({ pathname: '/admin/truyen/chinh-sua', params: { id: book.id } })}><Image source={{ uri: book.cover }} style={styles.cover} /><View style={{ flex: 1 }}><Text style={styles.bookTitle}>{book.title}</Text><Text style={styles.bookMeta}>{book.author} · {formatDisplayDate(book.publishedAt)}</Text></View><StatusBadge status={book.status} /></Card>)}

        <SectionHeader title="Đánh giá mới nhất" action="Xem tất cả" onPress={() => router.push('/admin/danh-gia')} />
        {recentReviews.length ? recentReviews.map((review) => (
          <Card key={review.id} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.bookTitle}>{review.userName}</Text>
              <Text style={{ color: '#f5c518', fontWeight: '800' }}>{'★'.repeat(review.rating)}</Text>
            </View>
            <Text style={styles.subtitle} numberOfLines={2}>{review.content}</Text>
            <Text style={styles.bookMeta}>{formatDisplayDate(review.createdAt, true)}</Text>
          </Card>
        )) : <Card><Text style={styles.allClear}>Chưa có đánh giá nào.</Text></Card>}

        <SectionHeader title="Tất cả module" />
        <View style={styles.moduleGrid}>{modules.map(([label, icon, route]) => <Card key={label} style={styles.module} onPress={() => router.push(route)}><Ionicons name={icon} size={24} color={colors.tertiary} /><Text style={styles.moduleLabel}>{label}</Text></Card>)}</View>
      </ScrollView>
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  welcome: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  eyebrow: { ...typography.caption, color: colors.tertiary, fontWeight: '900', letterSpacing: 1 },
  title: { ...typography.display, color: colors.text, marginTop: spacing.xs },
  subtitle: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surface3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: { width: '48%' },
  revenue: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.sm },
  revenueLabel: { ...typography.caption, color: colors.muted, fontWeight: '800' },
  revenueValue: { ...typography.title, color: colors.tertiary, marginTop: spacing.xs },
  revenueDivider: { height: 42, width: 1, backgroundColor: colors.surface3 },
  quickGrid: { flexDirection: 'row', gap: spacing.sm },
  quickItem: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface2 },
  quickIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(210,187,255,0.1)' },
  quickLabel: { ...typography.caption, color: colors.text, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  barRow: { marginBottom: spacing.md },
  barLabel: { ...typography.caption, color: colors.text, marginBottom: 4 },
  track: { height: 9, borderRadius: 5, overflow: 'hidden', backgroundColor: colors.surface3 },
  bar: { height: '100%', borderRadius: 5, backgroundColor: colors.primaryContainer },
  barValue: { ...typography.caption, color: colors.muted, marginTop: 3, textAlign: 'right' },
  transactionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  smallIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3 },
  transactionTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  transactionMeta: { ...typography.caption, color: colors.outline },
  bookRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  cover: { width: 46, height: 64, borderRadius: radius.sm },
  bookTitle: { ...typography.body, color: colors.text, fontWeight: '800' },
  bookMeta: { ...typography.caption, color: colors.muted, marginTop: 3 },
  allClear: { ...typography.body, color: colors.tertiary, fontWeight: '700' },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  module: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  moduleLabel: { ...typography.body, color: colors.text, fontWeight: '800' },
});
