import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav, Card, ConfirmDialog, DangerButton, Screen, SecondaryButton, StatusBadge } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { getAccountStats, getCurrentUser, getNotifications, logout } from '../services/localDataService';

const menuItems = [
  { title: 'Thông tin cá nhân', subtitle: 'Cập nhật tên và ảnh đại diện', icon: 'person-outline', route: '/thong-tin-ca-nhan' },
  { title: 'Truyện đã lưu', subtitle: 'Tủ sách yêu thích của bạn', icon: 'bookmark-outline', route: '/truyen-da-luu' },
  { title: 'Lịch sử đọc', subtitle: 'Tiếp tục từ vị trí gần nhất', icon: 'time-outline', route: '/lich-su-doc' },
  { title: 'Lịch sử giao dịch', subtitle: 'Nạp xu và mua chương', icon: 'receipt-outline', route: '/lich-su-giao-dich' },
  { title: 'Thông báo', subtitle: 'Chương mới, giao dịch và hệ thống', icon: 'notifications-outline', route: '/thong-bao', badge: true },
  { title: 'Cài đặt', subtitle: 'Giao diện, trình đọc và dữ liệu', icon: 'settings-outline', route: '/cai-dat' },
];

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ saved: 0, reading: 0, completed: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    getCurrentUser().then(async (currentUser) => {
      if (!currentUser) return;
      const [nextStats, notifications] = await Promise.all([
        getAccountStats(currentUser.id),
        getNotifications(currentUser.id),
      ]);
      if (active) {
        setUser(currentUser);
        setStats(nextStats);
        setUnreadCount(notifications.filter((item) => !item.read).length);
      }
    });
    return () => { active = false; };
  }, []));

  const handleLogout = async () => {
    await logout();
    setConfirmLogout(false);
    router.replace('/dang-nhap');
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Tài khoản</Text>
          <Pressable accessibilityLabel="Mở thông báo" onPress={() => router.push('/thong-bao')} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={23} color={colors.primary} />
            {unreadCount ? <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{Math.min(9, unreadCount)}</Text></View> : null}
          </Pressable>
        </View>

        <Card style={styles.profile}>
          <View style={styles.avatar}>
            {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImage} /> : <Ionicons name="person" size={34} color={colors.primary} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || 'Độc giả Mika'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <StatusBadge status="active" label={user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
          </View>
          <Pressable accessibilityLabel="Chỉnh sửa hồ sơ" onPress={() => router.push('/thong-tin-ca-nhan')} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </Pressable>
        </Card>

        <Card style={styles.balance}>
          <View><Text style={styles.label}>Số dư hiện tại</Text><Text style={styles.coin}>{Number(user?.coinBalance || 0).toLocaleString('vi-VN')} xu</Text></View>
          <SecondaryButton title="Nạp xu" onPress={() => router.push('/nap-xu')} />
        </Card>

        <View style={styles.stats}>
          <Stat value={stats.saved} label="Đã lưu" />
          <Stat value={stats.reading} label="Đang đọc" />
          <Stat value={stats.completed} label="Hoàn thành" />
        </View>

        <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable key={item.route} onPress={() => router.push(item.route)} style={[styles.menuItem, index < menuItems.length - 1 && styles.menuBorder]}>
              <View style={styles.menuIcon}><Ionicons name={item.icon} size={21} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              {item.badge && unreadCount ? <View style={styles.countBadge}><Text style={styles.countText}>{unreadCount}</Text></View> : null}
              <Ionicons name="chevron-forward" size={19} color={colors.outline} />
            </Pressable>
          ))}
        </Card>

        {user?.role === 'admin' ? (
          <SecondaryButton title="Chuyển sang Admin" icon="shield-checkmark-outline" onPress={() => router.push('/admin')} style={{ marginTop: spacing.xl }} />
        ) : null}
        <DangerButton title="Đăng xuất" icon="log-out-outline" onPress={() => setConfirmLogout(true)} style={{ marginTop: spacing.xxl }} />
      </ScrollView>
      <BottomNav router={router} active="account" />
      <ConfirmDialog
        visible={confirmLogout}
        title="Đăng xuất?"
        message="Phiên đăng nhập sẽ được xóa, nhưng tài khoản và dữ liệu đọc trên thiết bị vẫn được giữ nguyên."
        confirmText="Đăng xuất"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        isDanger
      />
    </Screen>
  );
}

function Stat({ value, label }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 120 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  pageTitle: { ...typography.display, color: colors.text },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { position: 'absolute', top: 2, right: 2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.dangerContainer, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notificationBadgeText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { ...typography.title, color: colors.text },
  email: { ...typography.body, color: colors.muted },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  balance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.xl },
  label: { ...typography.caption, color: colors.muted },
  coin: { ...typography.heading, color: colors.primary, marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.lg },
  statValue: { ...typography.heading, color: colors.text },
  statLabel: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  menuIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: 'rgba(124,58,237,0.15)', alignItems: 'center', justifyContent: 'center' },
  menuTitle: { ...typography.body, color: colors.text, fontWeight: '800' },
  menuSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  countBadge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: colors.white, fontSize: 11, fontWeight: '900' },
});
