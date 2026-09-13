import { useMemo,  useTheme } from '../hooks/useTheme';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav, Card, ConfirmDialog, DangerButton, Screen, SecondaryButton, StatusBadge } from '../components/UI';
import { radius, spacing, typography } from '../constants/theme';
import { getAccountStats, getCurrentUser, getNotifications, logout, upgradeVip, syncUserProfile } from '../services/localDataService';

const menuItems = [
  { title: 'Thông tin cá nhân', subtitle: 'Cập nhật tên và ảnh đại diện', icon: 'person-outline', route: '/thong-tin-ca-nhan' },
  { title: 'Truyện đã lưu', subtitle: 'Tủ sách yêu thích của bạn', icon: 'bookmark-outline', route: '/truyen-da-luu' },
  { title: 'Lịch sử đọc', subtitle: 'Tiếp tục từ vị trí gần nhất', icon: 'time-outline', route: '/lich-su-doc' },
  { title: 'Lịch sử giao dịch', subtitle: 'Nạp xu và mua chương', icon: 'receipt-outline', route: '/lich-su-giao-dich' },
  { title: 'Thông báo', subtitle: 'Chương mới, giao dịch và hệ thống', icon: 'notifications-outline', route: '/thong-bao', badge: true },
  { title: 'Cài đặt', subtitle: 'Giao diện, trình đọc và dữ liệu', icon: 'settings-outline', route: '/cai-dat' },
];

export default function Account() {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ saved: 0, reading: 0, completed: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [dialogConfig, setDialogConfig] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const currentUser = await syncUserProfile();
      if (currentUser) {
        const [nextStats, notifications] = await Promise.all([
          getAccountStats(currentUser.id),
          getNotifications(currentUser.id),
        ]);
        setUser(currentUser);
        setStats(nextStats);
        setUnreadCount(notifications.filter((item) => !item.read).length);
      }
    } catch (error) {
      console.error('Refresh profile failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleUpgradeVip = async () => {
    setDialogConfig({
      title: user?.isVip ? 'Gia hạn đặc quyền VIP?' : 'Xác nhận nâng cấp VIP?',
      message: 'Hệ thống sẽ trừ 1.000 xu trong số dư tài khoản của bạn để kích hoạt hoặc gia hạn đặc quyền VIP trong thời hạn 1 tháng (30 ngày).',
      confirmText: user?.isVip ? 'Đồng ý gia hạn' : 'Đồng ý nâng cấp',
      onConfirm: async () => {
        setDialogConfig(null);
        const res = await upgradeVip();
        if (res.success) {
          setUser(res.user);
        } else {
          setDialogConfig({
            title: 'Nâng cấp thất bại',
            message: res.message || 'Số dư không đủ hoặc có lỗi xảy ra.',
            confirmText: 'Đóng',
            onConfirm: () => setDialogConfig(null),
            onCancel: () => setDialogConfig(null),
          });
        }
      },
      onCancel: () => setDialogConfig(null),
    });
  };

  useFocusEffect(useCallback(() => {
    let active = true;
    syncUserProfile().then(async (currentUser) => {
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

  const goldColor = isDark ? '#D4AF37' : '#B8860B';

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={styles.name}>{user?.name || 'Độc giả Mika'}</Text>
              {user?.isVip ? (
                <View style={styles.vipBadge}>
                  <Ionicons name="sparkles" size={11} color={goldColor} />
                  <Text style={styles.vipBadgeText}>VIP</Text>
                </View>
              ) : null}
            </View>
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

        {/* VIP Upgrade/Status Card */}
        <Card style={user?.isVip ? styles.vipCardActive : styles.vipCard}>
          {user?.isVip ? (
            <View style={styles.vipContent}>
              <View style={styles.vipHeader}>
                <Ionicons name="sparkles" size={20} color={goldColor} />
                <Text style={styles.vipTitleActive}>ĐẶC QUYỀN VIP ĐANG HOẠT ĐỘNG</Text>
              </View>
              <Text style={styles.vipText}>
                Chào mừng Thượng khách! Bạn đã được tự động mở khóa toàn bộ các chương truyện trên Mika Library.
              </Text>
              {user?.vipExpiresAt ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                  <Ionicons name="time-outline" size={14} color={goldColor} />
                  <Text style={[styles.vipText, { color: goldColor, fontWeight: '800' }]}>
                    Hạn dùng: {new Date(user.vipExpiresAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              ) : null}
              <Pressable onPress={handleUpgradeVip} style={styles.vipButtonActive}>
                <Text style={styles.vipButtonTextActive}>Gia hạn thêm 1 tháng →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.vipContent}>
              <View style={styles.vipHeader}>
                <Ionicons name="diamond-outline" size={18} color={colors.primary} />
                <Text style={styles.vipTitle}>NÂNG CẤP THÀNH VIÊN VIP</Text>
              </View>
              <Text style={styles.vipText}>
                Chỉ với <Text style={styles.vipHighlight}>1.000 xu/tháng</Text>, nhận ngay đặc quyền đọc toàn bộ các chương khóa của tất cả đầu sách.
              </Text>
              <Pressable onPress={handleUpgradeVip} style={styles.vipButton}>
                <Text style={styles.vipButtonText}>Nâng cấp ngay →</Text>
              </Pressable>
            </View>
          )}
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
      <ConfirmDialog
        visible={Boolean(dialogConfig)}
        title={dialogConfig?.title || ''}
        message={dialogConfig?.message || ''}
        confirmText={dialogConfig?.confirmText || ''}
        onConfirm={dialogConfig?.onConfirm || (() => {})}
        onCancel={dialogConfig?.onCancel || (() => {})}
      />
    </Screen>
  );
}

function Stat({ value, label }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const getStyles = (colors, isDark = false) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 120 },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : '#FFFBEB',
    borderColor: isDark ? '#D4AF37' : '#D97706',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  vipBadgeText: {
    color: isDark ? '#D4AF37' : '#B8860B',
    fontSize: 10,
    fontWeight: '900',
  },
  vipCard: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.highlightBg,
    marginVertical: spacing.xs,
  },
  vipCardActive: {
    borderColor: isDark ? '#D4AF37' : '#F59E0B',
    borderWidth: 1.5,
    backgroundColor: isDark ? 'rgba(212, 175, 55, 0.08)' : '#FFFDF0',
    marginVertical: spacing.xs,
  },
  vipContent: {
    gap: spacing.xs,
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vipTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 0.3,
    flex: 1,
    flexShrink: 1,
  },
  vipTitleActive: {
    ...typography.caption,
    color: isDark ? '#D4AF37' : '#B8860B',
    fontWeight: '900',
    letterSpacing: 0.3,
    flex: 1,
    flexShrink: 1,
  },
  vipText: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  vipHighlight: {
    color: colors.text,
    fontWeight: '800',
  },
  vipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  vipButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '800',
  },
  vipButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  vipButtonTextActive: {
    color: colors.white,
    ...typography.body,
    fontWeight: '800',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  pageTitle: { ...typography.display, color: colors.text },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { position: 'absolute', top: 2, right: 2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
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
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  statValue: { ...typography.heading, color: colors.text },
  statLabel: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.highlightBg, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { ...typography.body, color: colors.text, fontWeight: '800' },
  menuSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  countBadge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: colors.white, fontSize: 11, fontWeight: '900' },
});
