import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, EmptyState, LoadingSkeleton, Screen } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getCurrentUser, getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/localDataService';

const notificationMeta = {
  chapter: { icon: 'book-outline', color: colors.primary, background: 'rgba(124,58,237,0.16)' },
  transaction: { icon: 'wallet-outline', color: colors.tertiary, background: 'rgba(78,222,163,0.13)' },
  system: { icon: 'information-circle-outline', color: colors.warning, background: 'rgba(255,183,77,0.13)' },
};

export default function Notifications() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const current = await getCurrentUser();
    const notifications = current ? await getNotifications(current.id) : [];
    setUser(current);
    setItems(notifications);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleRead = async (item) => {
    if (!user) return;
    await markNotificationRead(user.id, item.id, !item.read);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: !item.read } : entry));
  };

  const open = async (item) => {
    if (!user) return;
    if (!item.read) {
      await markNotificationRead(user.id, item.id, true);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    }
    if (item.route) router.push({ pathname: item.route, params: item.params || {} });
  };

  const readAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  const unread = items.filter((item) => !item.read).length;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader
        title="Thông báo"
        subtitle={unread ? `${unread} thông báo chưa đọc` : 'Bạn đã xem tất cả'}
        onBack={() => router.back()}
        rightElement={unread ? (
          <Pressable accessibilityLabel="Đánh dấu tất cả đã đọc" onPress={readAll} style={styles.readAllButton}>
            <Ionicons name="checkmark-done" size={21} color={colors.primary} />
          </Pressable>
        ) : null}
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {loading ? [1, 2, 3].map((item) => <LoadingSkeleton key={item} height={112} style={{ marginBottom: spacing.md }} />) : null}
        {!loading && items.map((item) => {
          const meta = notificationMeta[item.type] || notificationMeta.system;
          return (
            <Pressable key={item.id} onPress={() => open(item)} style={[styles.item, !item.read && styles.itemUnread]}>
              <View style={[styles.icon, { backgroundColor: meta.background }]}><Ionicons name={meta.icon} size={24} color={meta.color} /></View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>{item.title}</Text>
                  {!item.read ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.date}>{formatDisplayDate(item.createdAt, true)}</Text>
              </View>
              <Pressable
                accessibilityLabel={item.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                onPress={(event) => { event.stopPropagation?.(); toggleRead(item); }}
                hitSlop={10}
                style={styles.readButton}
              >
                <Ionicons name={item.read ? 'mail-unread-outline' : 'checkmark-circle-outline'} size={20} color={item.read ? colors.outline : colors.primary} />
              </Pressable>
            </Pressable>
          );
        })}
        {!loading && !items.length ? <EmptyState icon="notifications-off-outline" title="Chưa có thông báo" message="Thông báo về chương mới và giao dịch sẽ xuất hiện tại đây." /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  readAllButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: spacing.md },
  itemUnread: { backgroundColor: 'rgba(124,58,237,0.13)', borderColor: 'rgba(210,187,255,0.3)' },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  titleUnread: { fontWeight: '900' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  message: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.outline, marginTop: spacing.sm },
  readButton: { padding: spacing.xs },
});
