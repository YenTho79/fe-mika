import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter } from '../../components/AdminUI';
import { BottomSheet, Card, EmptyState, FilterChip, PrimaryButton, Screen, SecondaryButton, StatCard, Toast } from '../../components/UI';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { formatDisplayDate, getTransactions, getUsers, updateTransactionStatus } from '../../services/localDataService';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState('');
  const load = useCallback(async () => {
    const [items, userItems] = await Promise.all([getTransactions(), getUsers()]);
    setTransactions([...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    setUsers(userItems);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [String(user.id), user])), [users]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return transactions.filter((item) => {
      const user = userMap[String(item.userId)];
      return (!needle || `${item.id} ${user?.name || ''} ${user?.email || ''}`.toLocaleLowerCase('vi-VN').includes(needle))
        && (type === 'all' || item.type === type)
        && (status === 'all' || item.status === status);
    });
  }, [query, status, transactions, type, userMap]);
  const successful = transactions.filter((item) => item.status === 'success');
  const revenue = successful.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const changeStatus = async (nextStatus) => {
    const result = await updateTransactionStatus(detail.id, nextStatus);
    if (result.success) {
      setToast(nextStatus === 'success' ? 'Đã duyệt giao dịch; xu chỉ được cộng một lần.' : 'Đã đánh dấu giao dịch thất bại.');
      setDetail(result.transaction);
      load();
    }
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Quản lý giao dịch" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title="Dòng tiền mô phỏng" description="Xem và đối soát giao dịch được lưu local." />
        <View style={styles.stats}><StatCard title="Tổng giao dịch" value={transactions.length} icon="receipt-outline" style={styles.stat} /><StatCard title="Doanh thu" value={`${revenue.toLocaleString('vi-VN')}đ`} icon="cash-outline" color="#277143" style={styles.stat} /></View>
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm mã, tên hoặc email...">
          {[['all', 'Mọi loại'], ['deposit', 'Nạp xu'], ['buy_chapter', 'Mua chương'], ['chapter_purchase', 'Mua chương'], ['admin_adjustment', 'Điều chỉnh']].map(([value, label]) => <FilterChip key={`${value}-${label}`} label={label} active={type === value} onPress={() => setType(value)} />)}
          {[['all', 'Mọi trạng thái'], ['success', 'Thành công'], ['pending', 'Đang xử lý'], ['failed', 'Thất bại']].map(([value, label]) => <FilterChip key={value} label={label} active={status === value} onPress={() => setStatus(value)} />)}
        </AdminSearchFilter>
        {filtered.map((item) => {
          const user = userMap[String(item.userId)];
          return <AdminListItem key={item.id} icon={item.type === 'deposit' ? 'arrow-down-circle-outline' : 'cart-outline'} title={item.id} subtitle={user ? `${user.name} · ${user.email}` : `Người dùng ${item.userId}`} meta={`${Number(item.coin || 0).toLocaleString('vi-VN')} xu · ${Number(item.amount || 0).toLocaleString('vi-VN')}đ · ${formatDisplayDate(item.createdAt, true)}`} status={item.status} onPress={() => setDetail(item)}>
            <Pressable style={styles.detailButton} onPress={() => setDetail(item)}><Ionicons name="eye-outline" size={16} color={colors.primary} /><Text style={styles.detailText}>Chi tiết</Text></Pressable>
          </AdminListItem>;
        })}
        {!filtered.length ? <EmptyState icon="receipt-outline" title="Không có giao dịch phù hợp" /> : null}
      </ScrollView>
      <BottomSheet visible={Boolean(detail)} title="Chi tiết giao dịch" onClose={() => setDetail(null)}>
        {detail ? <View>
          <DetailRow label="Mã giao dịch" value={detail.id} />
          <DetailRow label="Người dùng" value={userMap[String(detail.userId)]?.name || detail.userId} />
          <DetailRow label="Loại" value={detail.type} />
          <DetailRow label="Số xu" value={`${detail.coin || 0} xu`} />
          <DetailRow label="Số tiền" value={`${Number(detail.amount || 0).toLocaleString('vi-VN')}đ`} />
          <DetailRow label="Phương thức" value={detail.method || 'Không có'} />
          <DetailRow label="Thời gian" value={formatDisplayDate(detail.createdAt, true)} />
          <DetailRow label="Trạng thái" value={detail.status} />
          {detail.description ? <Card style={{ marginTop: spacing.md }}><Text style={styles.description}>{detail.description}</Text></Card> : null}
          {detail.status === 'pending' ? <View style={styles.sheetActions}><SecondaryButton title="Đánh dấu thất bại" onPress={() => changeStatus('failed')} style={{ flex: 1 }} /><PrimaryButton title="Duyệt thành công" onPress={() => changeStatus('success')} style={{ flex: 1 }} /></View> : <Text style={styles.lockedNote}>Giao dịch đã kết thúc; mở chi tiết không làm thay đổi số dư.</Text>}
        </View> : null}
      </BottomSheet>
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

function DetailRow({ label, value }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }
const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  stat: { width: '48%' },
  detailButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: 'rgba(210,187,255,0.1)' },
  detailText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  detailLabel: { ...typography.body, color: colors.muted },
  detailValue: { ...typography.body, color: colors.text, fontWeight: '700', textAlign: 'right', flex: 1 },
  description: { ...typography.body, color: colors.muted },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  lockedNote: { ...typography.caption, color: colors.tertiary, marginTop: spacing.lg, textAlign: 'center' },
});
