import { useTheme } from '../../hooks/useTheme';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader, AdminListItem, AdminPageTitle, AdminSearchFilter } from '../../components/AdminUI';
import { BottomSheet, ConfirmDialog, EmptyState, FilterChip, PrimaryButton, Screen, SecondaryButton, TextField, Toast } from '../../components/UI';
import { radius, spacing, typography } from '../../constants/theme';
import { adjustUserCoinBalance, getCurrentUser, getReadingProgressList, getSavedBooks, getTransactions, getUsers, saveUser } from '../../services/localDataService';

function Action({ icon, label, onPress, danger }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return <Pressable onPress={onPress} style={[styles.action, danger && styles.danger]}><Ionicons name={icon} size={15} color={danger ? colors.danger : colors.primary} /><Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text></Pressable>;
}

export default function UserManagement() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [pendingToggle, setPendingToggle] = useState(null);
  const [detail, setDetail] = useState(null);
  const [coinUser, setCoinUser] = useState(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinReason, setCoinReason] = useState('');
  const [coinError, setCoinError] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const [items, admin] = await Promise.all([getUsers(), getCurrentUser()]);
    setUsers(items);
    setCurrentUser(admin);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return users.filter((user) => (!needle || `${user.name} ${user.email}`.toLocaleLowerCase('vi-VN').includes(needle))
      && (role === 'all' || user.role === role)
      && (status === 'all' || (status === 'active' ? user.status === 'active' : user.status !== 'active')));
  }, [query, role, status, users]);

  const openDetail = async (user) => {
    const [saved, progress, transactions] = await Promise.all([getSavedBooks(user.id), getReadingProgressList(user.id), getTransactions(user.id)]);
    setDetail({ user, saved, progress, transactions });
  };
  const toggleStatus = async () => {
    if (!pendingToggle) return;
    const nextStatus = pendingToggle.status === 'active' ? 'blocked' : 'active';
    await saveUser({ ...pendingToggle, status: nextStatus });
    setPendingToggle(null);
    setToast(nextStatus === 'active' ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
    load();
  };
  const adjustCoins = async () => {
    const result = await adjustUserCoinBalance({ userId: coinUser.id, amountChange: Number(coinAmount), reason: coinReason, adminId: currentUser.id });
    if (!result.success) { setCoinError(result.message); return; }
    setCoinUser(null); setCoinAmount(''); setCoinReason(''); setCoinError('');
    setToast(`Đã cập nhật số dư thành ${result.balance.toLocaleString('vi-VN')} xu.`);
    load();
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Quản lý người dùng" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title={`${users.length} tài khoản`} description="Khóa tài khoản và điều chỉnh số dư demo có ghi lý do." />
        <AdminSearchFilter value={query} onChangeText={setQuery} placeholder="Tìm tên hoặc email...">
          {[['all', 'Mọi vai trò'], ['user', 'User'], ['admin', 'Admin']].map(([value, label]) => <FilterChip key={value} label={label} active={role === value} onPress={() => setRole(value)} />)}
          {[['all', 'Mọi trạng thái'], ['active', 'Active'], ['blocked', 'Blocked']].map(([value, label]) => <FilterChip key={value} label={label} active={status === value} onPress={() => setStatus(value)} />)}
        </AdminSearchFilter>
        {filtered.map((user) => <AdminListItem key={user.id} image={user.avatar} title={user.name} subtitle={user.email} meta={`${user.role} · ${(user.coinBalance || 0).toLocaleString('vi-VN')} xu`} status={user.status}>
          <Action icon="eye-outline" label="Chi tiết" onPress={() => openDetail(user)} />
          <Action icon="cash-outline" label="Điều chỉnh xu" onPress={() => { setCoinUser(user); setCoinAmount(''); setCoinReason(''); setCoinError(''); }} />
          <Action icon={user.status === 'active' ? 'lock-closed-outline' : 'lock-open-outline'} label={user.status === 'active' ? 'Khóa' : 'Mở khóa'} danger={user.status === 'active'} onPress={() => user.id === currentUser?.id ? setToast('Admin không thể tự khóa tài khoản đang đăng nhập.') : setPendingToggle(user)} />
        </AdminListItem>)}
        {!filtered.length ? <EmptyState icon="people-outline" title="Không tìm thấy người dùng" /> : null}
      </ScrollView>

      <ConfirmDialog visible={Boolean(pendingToggle)} title={pendingToggle?.status === 'active' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'} message={`${pendingToggle?.name || ''} sẽ ${pendingToggle?.status === 'active' ? 'không thể đăng nhập' : 'có thể đăng nhập trở lại'} trên thiết bị này.`} confirmText="Xác nhận" isDanger={pendingToggle?.status === 'active'} onConfirm={toggleStatus} onCancel={() => setPendingToggle(null)} />
      <BottomSheet visible={Boolean(detail)} title="Chi tiết người dùng" onClose={() => setDetail(null)}>
        {detail ? <ScrollView style={{ maxHeight: 460 }}>
          <View style={styles.profile}><Image source={{ uri: detail.user.avatar }} style={styles.avatar} /><View><Text style={styles.name}>{detail.user.name}</Text><Text style={styles.muted}>{detail.user.email}</Text></View></View>
          <View style={styles.detailStats}><DetailStat label="Truyện lưu" value={detail.saved.length} /><DetailStat label="Lịch sử đọc" value={detail.progress.length} /><DetailStat label="Giao dịch" value={detail.transactions.length} /></View>
          <Text style={styles.sectionTitle}>Đang đọc gần đây</Text>
          {detail.progress.slice(0, 4).map((item) => <Text key={item.bookId} style={styles.detailLine}>• {item.bookId} · Chương {item.chapterId || 1}</Text>)}
          {!detail.progress.length ? <Text style={styles.muted}>Chưa có lịch sử đọc.</Text> : null}
        </ScrollView> : null}
      </BottomSheet>
      <BottomSheet visible={Boolean(coinUser)} title="Điều chỉnh số dư xu" onClose={() => setCoinUser(null)}>
        <Text style={styles.muted}>{coinUser?.name} · hiện có {(coinUser?.coinBalance || 0).toLocaleString('vi-VN')} xu</Text>
        <TextField label="Số xu thay đổi" value={coinAmount} onChangeText={setCoinAmount} placeholder="Ví dụ: 100 hoặc -50" keyboardType="numbers-and-punctuation" style={{ marginTop: spacing.md }} />
        <TextField label="Lý do" value={coinReason} onChangeText={setCoinReason} placeholder="Nhập lý do điều chỉnh" error={coinError} />
        <PrimaryButton title="Lưu điều chỉnh" onPress={adjustCoins} />
        <SecondaryButton title="Hủy" onPress={() => setCoinUser(null)} style={{ marginTop: spacing.sm }} />
      </BottomSheet>
      <Toast visible={Boolean(toast)} message={toast} type={toast.includes('không thể') ? 'danger' : 'success'} onDismiss={() => setToast('')} />
    </Screen>
  );
}

function DetailStat({ label, value }) {
  const { colors } = useTheme();
  const styles = getStyles(colors); return <View style={styles.detailStat}><Text style={styles.detailValue}>{value}</Text><Text style={styles.detailLabel}>{label}</Text></View>; }

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.emptyCircleBg },
  danger: { backgroundColor: 'rgba(255,180,171,0.1)' },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  name: { ...typography.title, color: colors.text },
  muted: { ...typography.body, color: colors.muted },
  detailStats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  detailStat: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface2 },
  detailValue: { ...typography.heading, color: colors.tertiary },
  detailLabel: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  detailLine: { ...typography.body, color: colors.muted, marginBottom: spacing.xs },
});
