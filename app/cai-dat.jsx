import { useMemo,  useTheme } from '../hooks/useTheme';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, ConfirmDialog, FilterChip, LoadingSkeleton, Screen, Toast } from '../components/UI';
import { radius, spacing, typography } from '../constants/theme';
import {
  clearSearchHistory,
  deleteReadingProgress,
  getAppSettings,
  getCurrentUser,
  restoreDemoData,
  saveAppSettings,
} from '../services/localDataService';

const fontSizes = [
  { value: 16, label: 'Nhỏ' },
  { value: 18, label: 'Vừa' },
  { value: 22, label: 'Lớn' },
  { value: 26, label: 'Rất lớn' },
];

export default function Settings() {
  const { colors, changeTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [toast, setToast] = useState('');

  useFocusEffect(useCallback(() => {
    getAppSettings().then(setSettings);
  }, []));

  const update = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveAppSettings(next);
    if (patch.appearance) {
      changeTheme(patch.appearance === 'system' ? 'dark' : patch.appearance);
    }
  };

  const confirm = async () => {
    const action = confirmAction;
    setConfirmAction('');
    if (action === 'search') {
      await clearSearchHistory();
      setToast('Đã xóa lịch sử tìm kiếm.');
    } else if (action === 'reading') {
      const user = await getCurrentUser();
      if (user) await deleteReadingProgress(user.id);
      setToast('Đã xóa lịch sử đọc.');
    } else if (action === 'restore') {
      await restoreDemoData();
      const defaults = await getAppSettings();
      setSettings(defaults);
      setToast('Đã khôi phục dữ liệu demo.');
    }
  };

  const confirmation = {
    search: { title: 'Xóa lịch sử tìm kiếm?', message: 'Các từ khóa đã tìm trên thiết bị sẽ bị xóa.', confirmText: 'Xóa' },
    reading: { title: 'Xóa lịch sử đọc?', message: 'Toàn bộ tiến độ và vị trí đọc của tài khoản hiện tại sẽ bị xóa. Thao tác này không thể hoàn tác.', confirmText: 'Xóa' },
    restore: { title: 'Khôi phục dữ liệu demo?', message: 'Truyện, chương, đánh giá, giao dịch, tiến độ và các cài đặt local sẽ trở về dữ liệu mẫu. Tài khoản hiện tại vẫn được giữ.', confirmText: 'Khôi phục' },
  }[confirmAction];

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Cài đặt" onBack={() => router.back()} />
      {!settings ? (
        <View style={styles.content}><LoadingSkeleton height={520} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Section title="Giao diện ứng dụng">
            <Card style={styles.card}>
              <Text style={styles.itemTitle}>Chế độ hiển thị</Text>
              <Text style={styles.itemSubtitle}>Chọn giao diện sáng hoặc tối, hoặc đồng bộ với thiết bị.</Text>
              <View style={styles.chips}>
                <FilterChip label="Sáng" icon="sunny-outline" active={settings.appearance === 'light'} onPress={() => update({ appearance: 'light' })} />
                <FilterChip label="Tối" icon="moon-outline" active={settings.appearance === 'dark'} onPress={() => update({ appearance: 'dark' })} />
                <FilterChip label="Theo hệ thống" icon="phone-portrait-outline" active={settings.appearance === 'system'} onPress={() => update({ appearance: 'system' })} />
              </View>
            </Card>
          </Section>

          <Section title="Trình đọc">
            <Card style={styles.card}>
              <Text style={styles.itemTitle}>Cỡ chữ mặc định</Text>
              <Text style={styles.itemSubtitle}>Áp dụng khi mở trình đọc và có thể chỉnh lại trong từng phiên.</Text>
              <View style={styles.chips}>
                {fontSizes.map((option) => <FilterChip key={option.value} label={`${option.label} · ${option.value}`} active={Number(settings.defaultFontSize) === option.value} onPress={() => update({ defaultFontSize: option.value })} />)}
              </View>
              <View style={styles.divider} />
              <SettingSwitch
                icon="bookmark-outline"
                title="Tự lưu tiến độ đọc"
                subtitle="Ghi nhớ chương và vị trí gần nhất khi rời trình đọc."
                value={settings.autoSaveProgress}
                onValueChange={(value) => update({ autoSaveProgress: value })}
              />
            </Card>
          </Section>

          <Section title="Thông báo">
            <Card style={styles.card}>
              <SettingSwitch
                icon="notifications-outline"
                title="Thông báo chương mới"
                subtitle="Mô phỏng nhận thông báo khi truyện đã lưu có chương mới."
                value={settings.newChapterNotifications}
                onValueChange={(value) => update({ newChapterNotifications: value })}
              />
            </Card>
          </Section>

          <Section title="Dữ liệu trên thiết bị">
            <Card style={styles.actionCard}>
              <ActionRow icon="search-outline" title="Xóa lịch sử tìm kiếm" onPress={() => setConfirmAction('search')} />
              <ActionRow icon="time-outline" title="Xóa lịch sử đọc" onPress={() => setConfirmAction('reading')} danger />
              <ActionRow icon="refresh-outline" title="Khôi phục dữ liệu demo" onPress={() => setConfirmAction('restore')} danger last />
            </Card>
          </Section>

          <Section title="Về ứng dụng">
            <Card style={styles.about}>
              <View style={styles.logo}><Ionicons name="book" size={28} color={colors.white} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutTitle}>Mika Books</Text>
                <Text style={styles.itemSubtitle}>Phiên bản {Constants.expoConfig?.version || '1.0.0'}</Text>
              </View>
            </Card>
            <Text style={styles.aboutText}>Ứng dụng đọc truyện demo hoạt động với dữ liệu local, giúp bạn lưu truyện, theo dõi tiến độ, mua chương bằng xu mô phỏng và tùy chỉnh trải nghiệm đọc.</Text>
          </Section>
        </ScrollView>
      )}
      <ConfirmDialog
        visible={Boolean(confirmAction)}
        title={confirmation?.title || ''}
        message={confirmation?.message}
        confirmText={confirmation?.confirmText}
        onConfirm={confirm}
        onCancel={() => setConfirmAction('')}
        isDanger={Boolean(confirmAction)}
      />
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

function Section({ title, children }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function SettingSwitch({ icon, title, subtitle, value, onValueChange }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.switchRow}>
      <View style={styles.settingIcon}><Ionicons name={icon} size={21} color={colors.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.itemTitle}>{title}</Text><Text style={styles.itemSubtitle}>{subtitle}</Text></View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.surface3, true: colors.primaryContainer }} thumbColor={value ? colors.primary : colors.outline} />
    </View>
  );
}

function ActionRow({ icon, title, onPress, danger, last }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable onPress={onPress} style={[styles.actionRow, !last && styles.actionDivider]}>
      <Ionicons name={icon} size={21} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.actionText, danger && { color: colors.danger }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={19} color={colors.outline} />
    </Pressable>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  card: { gap: spacing.md },
  itemTitle: { ...typography.body, color: colors.text, fontWeight: '800' },
  itemSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.outline + '20', marginVertical: spacing.xs },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.highlightBg, alignItems: 'center', justifyContent: 'center' },
  actionCard: { padding: 0, overflow: 'hidden' },
  actionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  actionDivider: { borderBottomWidth: 1, borderBottomColor: colors.outline + '20' },
  actionText: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  about: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { ...typography.title, color: colors.text },
  aboutText: { ...typography.body, color: colors.muted, paddingHorizontal: spacing.xs, marginTop: spacing.md },
});
