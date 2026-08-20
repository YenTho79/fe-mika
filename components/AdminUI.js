import { useCallback, useState, useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { AppHeader, Card, ConfirmDialog, EmptyState, SearchField, StatusBadge } from './UI';
import { radius, shadow, spacing, typography } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getCurrentUser } from '../services/localDataService';

export const FALLBACK_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop';

export function RoleGuard({ children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const [state, setState] = useState({ loading: true, user: null });

  useFocusEffect(useCallback(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (active) setState({ loading: false, user });
    });
    return () => { active = false; };
  }, []));

  if (state.loading) {
    return <View style={styles.guard}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (state.user?.role !== 'admin') {
    return (
      <View style={styles.guard}>
        <EmptyState
          icon="lock-closed-outline"
          title="Không có quyền truy cập"
          message="Khu vực quản trị chỉ dành cho tài khoản Admin. Phân quyền này chỉ phục vụ bản demo local."
          actionTitle="Về giao diện người dùng"
          onAction={() => router.replace('/trang-chu')}
        />
      </View>
    );
  }
  return children;
}

export function AdminHeader({ title, subtitle, back = false, rightIcon, onRight }) {
  const router = useRouter();
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      onBack={back ? () => router.back() : undefined}
      rightIcon={rightIcon}
      onRight={onRight}
    />
  );
}

export function AdminBottomNav() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const pathname = usePathname();
  const router = useRouter();
  const items = [
    { label: 'Tổng quan', icon: 'grid-outline', route: '/admin', match: pathname === '/admin' },
    { label: 'Truyện', icon: 'library-outline', route: '/admin/truyen', match: pathname.startsWith('/admin/truyen') || pathname.startsWith('/admin/chuong') },
    { label: 'Người dùng', icon: 'people-outline', route: '/admin/nguoi-dung', match: pathname.startsWith('/admin/nguoi-dung') },
    { label: 'Giao dịch', icon: 'wallet-outline', route: '/admin/giao-dich', match: pathname.startsWith('/admin/giao-dich') },
    { label: 'Thêm', icon: 'add-circle', route: '/admin/truyen/them', match: pathname === '/admin/truyen/them' },
  ];
  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <Pressable key={item.label} onPress={() => router.push(item.route)} style={styles.navItem}>
          <Ionicons name={item.icon} size={22} color={item.match ? colors.primary : colors.outline} />
          <Text style={[styles.navLabel, item.match && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AdminFormSection({ title, description, children, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  return (
    <Card style={[styles.formSection, style]}>
      <Text style={styles.formTitle}>{title}</Text>
      {description ? <Text style={styles.formDescription}>{description}</Text> : null}
      <View style={styles.formBody}>{children}</View>
    </Card>
  );
}

export function AdminSearchFilter({ value, onChangeText, placeholder, children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={styles.searchBlock}>
      <SearchField value={value} onChangeText={onChangeText} placeholder={placeholder} />
      {children ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{children}</ScrollView> : null}
    </View>
  );
}

export function AdminListItem({ image, icon = 'document-text-outline', title, subtitle, meta, status, statusLabel, children, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [failed, setFailed] = useState(false);
  return (
    <Card style={styles.listCard} onPress={onPress}>
      {image ? (
        <Image source={{ uri: failed ? FALLBACK_COVER : image }} onError={() => setFailed(true)} style={styles.thumb} />
      ) : (
        <View style={styles.iconBox}><Ionicons name={icon} size={24} color={colors.primary} /></View>
      )}
      <View style={styles.listBody}>
        <View style={styles.listTop}>
          <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
          {status || statusLabel ? <StatusBadge status={status} label={statusLabel} /> : null}
        </View>
        {subtitle ? <Text style={styles.listSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.listMeta}>{meta}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </Card>
  );
}

export const AdminEmptyState = EmptyState;
export const ConfirmDeleteModal = (props) => <ConfirmDialog {...props} isDanger />;

export function AdminPageTitle({ eyebrow, title, description, action }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={styles.pageTitle}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.pageHeading}>{title}</Text>
        {description ? <Text style={styles.pageDescription}>{description}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  guard: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  nav: {
    position: 'absolute', left: 12, right: 12, bottom: 10, height: 66,
    borderRadius: 24, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: 'rgba(23,31,51,0.98)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...shadow,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navLabel: { ...typography.caption, color: colors.outline, fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: colors.primary },
  formSection: { marginBottom: spacing.lg },
  formTitle: { ...typography.title, color: colors.text },
  formDescription: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  formBody: { marginTop: spacing.lg },
  searchBlock: { marginBottom: spacing.lg },
  filters: { gap: spacing.sm, paddingTop: spacing.md },
  listCard: { flexDirection: 'row', padding: spacing.md, marginBottom: spacing.md },
  thumb: { width: 70, height: 98, borderRadius: radius.sm, backgroundColor: colors.surface3 },
  iconBox: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3 },
  listBody: { flex: 1, marginLeft: spacing.md },
  listTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  listTitle: { ...typography.title, flex: 1, color: colors.text },
  listSubtitle: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  listMeta: { ...typography.caption, color: colors.outline, marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  pageTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  eyebrow: { ...typography.caption, color: colors.tertiary, fontWeight: '900', letterSpacing: 1 },
  pageHeading: { ...typography.heading, color: colors.text, marginTop: spacing.xs },
  pageDescription: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
});
