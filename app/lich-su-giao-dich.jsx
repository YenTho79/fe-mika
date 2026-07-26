import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, EmptyState, FilterChip, LoadingSkeleton, Screen, StatusBadge } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getCurrentUser, getTransactions } from '../services/localDataService';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const isDeposit = (item) => item.type === 'deposit';
const statusLabel = { success: 'Thành công', pending: 'Đang xử lý', processing: 'Đang xử lý', failed: 'Thất bại' };

export default function TransactionHistory() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getCurrentUser().then(async (user) => {
      const transactions = user ? await getTransactions(user.id) : [];
      setItems(transactions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    }).finally(() => setLoading(false));
  }, []));

  const filtered = useMemo(() => items.filter((item) => (
    filter === 'all' || (filter === 'deposit' ? isDeposit(item) : !isDeposit(item))
  )), [filter, items]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Lịch sử giao dịch" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="Tất cả" active={filter === 'all'} onPress={() => setFilter('all')} count={items.length} />
          <FilterChip label="Nạp xu" active={filter === 'deposit'} onPress={() => setFilter('deposit')} count={items.filter(isDeposit).length} />
          <FilterChip label="Mua chương" active={filter === 'purchase'} onPress={() => setFilter('purchase')} count={items.filter((item) => !isDeposit(item)).length} />
        </ScrollView>

        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={128} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && filtered.map((item) => {
          const deposit = isDeposit(item);
          const coin = Number(item.coin ?? item.amount ?? 0);
          const normalizedStatus = item.status === 'processing' ? 'pending' : item.status || 'success';
          return (
            <Pressable key={item.id} onPress={() => router.push({ pathname: '/chi-tiet-giao-dich', params: { id: item.id } })}>
              <Card style={styles.card}>
                <View style={[styles.icon, { backgroundColor: deposit ? 'rgba(78,222,163,0.12)' : 'rgba(210,187,255,0.12)' }]}>
                  <Ionicons name={deposit ? 'add-circle-outline' : 'book-outline'} size={26} color={deposit ? colors.tertiary : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.topRow}>
                    <Text style={styles.title}>{deposit ? 'Nạp xu' : 'Mua chương'}</Text>
                    <StatusBadge
                      status={normalizedStatus === 'failed' ? 'danger' : normalizedStatus}
                      label={statusLabel[item.status] || statusLabel[normalizedStatus] || 'Thành công'}
                    />
                  </View>
                  <Text style={styles.description}>{item.description || (deposit ? `${item.method || 'Demo'} · ${formatMoney(item.amount)}` : item.chapterTitle || 'Mở khóa chương')}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={styles.date}>{formatDisplayDate(item.createdAt, true)}</Text>
                    <Text style={[styles.coin, { color: coin >= 0 ? colors.tertiary : colors.danger }]}>{coin >= 0 ? '+' : ''}{coin.toLocaleString('vi-VN')} xu</Text>
                  </View>
                  <View style={styles.codeRow}><Text style={styles.code}>#{item.id}</Text><Ionicons name="chevron-forward" size={17} color={colors.outline} /></View>
                </View>
              </Card>
            </Pressable>
          );
        })}
        {!loading && !filtered.length ? (
          <EmptyState
            icon="receipt-outline"
            title={items.length ? 'Không có giao dịch phù hợp' : 'Chưa có giao dịch'}
            message={items.length ? 'Hãy chọn một bộ lọc khác.' : 'Gói xu bạn nạp hoặc chương đã mua sẽ xuất hiện tại đây.'}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  filters: { gap: spacing.sm, paddingBottom: spacing.xl },
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.title, color: colors.text, flex: 1 },
  description: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.md },
  date: { ...typography.caption, color: colors.outline },
  coin: { ...typography.body, fontWeight: '900' },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  code: { ...typography.caption, color: colors.outline },
});
