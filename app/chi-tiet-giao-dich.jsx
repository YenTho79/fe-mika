import { useMemo,  useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, EmptyState, LoadingSkeleton, Screen, StatusBadge } from '../components/UI';
import { radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getCurrentUser, getTransactionById } from '../services/localDataService';

const statusLabel = { success: 'Thành công', pending: 'Đang xử lý', processing: 'Đang xử lý', failed: 'Thất bại' };
const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function TransactionDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(undefined);

  useEffect(() => {
    Promise.all([getTransactionById(id), getCurrentUser()]).then(([transaction, user]) => {
      setItem(transaction && String(transaction.userId) === String(user?.id) ? transaction : null);
    });
  }, [id]);

  const deposit = item?.type === 'deposit';
  const coin = Number(item?.coin ?? item?.amount ?? 0);
  const normalizedStatus = item?.status === 'processing' ? 'pending' : item?.status || 'success';

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Chi tiết giao dịch" onBack={() => router.back()} />
      {item === undefined ? (
        <View style={styles.content}><LoadingSkeleton height={360} /></View>
      ) : item === null ? (
        <EmptyState title="Không tìm thấy giao dịch" message="Giao dịch không tồn tại hoặc không thuộc tài khoản hiện tại." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.summary}>
            <View style={[styles.icon, { backgroundColor: deposit ? 'rgba(78,222,163,0.14)' : 'rgba(210,187,255,0.14)' }]}>
              <Ionicons name={deposit ? 'wallet-outline' : 'book-outline'} size={34} color={deposit ? colors.tertiary : colors.primary} />
            </View>
            <Text style={styles.title}>{deposit ? 'Nạp xu' : 'Mua chương'}</Text>
            <Text style={[styles.coin, { color: coin >= 0 ? colors.tertiary : colors.danger }]}>{coin >= 0 ? '+' : ''}{coin.toLocaleString('vi-VN')} xu</Text>
            <StatusBadge
              status={normalizedStatus === 'failed' ? 'danger' : normalizedStatus}
              label={statusLabel[item.status] || statusLabel[normalizedStatus]}
            />
          </Card>

          <Card style={styles.details}>
            <Detail label="Mã giao dịch" value={`#${item.id}`} />
            <Detail label="Thời gian" value={formatDisplayDate(item.createdAt, true)} />
            <Detail label="Loại giao dịch" value={deposit ? 'Nạp xu' : 'Mở khóa chương'} />
            {deposit ? <Detail label="Phương thức" value={item.method || 'Demo'} /> : null}
            {deposit ? <Detail label="Số tiền" value={formatMoney(item.amount)} /> : null}
            {item.bonus ? <Detail label="Xu thưởng" value={`+${Number(item.bonus).toLocaleString('vi-VN')} xu`} /> : null}
            {item.balanceAfter != null ? <Detail label="Số dư sau giao dịch" value={`${Number(item.balanceAfter).toLocaleString('vi-VN')} xu`} /> : null}
            <Detail label="Nội dung" value={item.description || item.chapterTitle || (deposit ? 'Nạp xu vào ví Mika' : 'Mở khóa chương')} last />
          </Card>
          <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={21} color={colors.tertiary} /><Text style={styles.noteText}>Đây là dữ liệu giao dịch mô phỏng và chỉ được lưu trên thiết bị.</Text></View>
        </ScrollView>
      )}
    </Screen>
  );
}

function Detail({ label, value, last }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View style={[styles.detailRow, !last && styles.divider]}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '—'}</Text></View>;
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  summary: { alignItems: 'center', gap: spacing.sm },
  icon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.title, color: colors.text },
  coin: { fontSize: 30, lineHeight: 38, fontWeight: '900' },
  details: { marginTop: spacing.xl, paddingVertical: 0 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xl, paddingVertical: spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { ...typography.body, color: colors.muted },
  value: { ...typography.body, color: colors.text, fontWeight: '800', flex: 1, textAlign: 'right' },
  note: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(78,222,163,0.09)', marginTop: spacing.lg },
  noteText: { ...typography.caption, color: colors.tertiary, flex: 1 },
});
