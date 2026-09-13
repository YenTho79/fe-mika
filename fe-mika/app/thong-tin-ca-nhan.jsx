import { useMemo,  useTheme } from '../hooks/useTheme';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, LoadingSkeleton, PrimaryButton, Screen, StatusBadge, TextField, Toast } from '../components/UI';
import { radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getCurrentUser, updateCurrentUserProfile } from '../services/localDataService';

const avatarOptions = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
];

export default function PersonalInfo() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useFocusEffect(useCallback(() => {
    getCurrentUser().then((current) => {
      setUser(current);
      setName(current?.name || '');
      setAvatar(current?.avatar || '');
    });
  }, []));

  const save = async () => {
    setSaving(true);
    const result = await updateCurrentUserProfile({ name, email: user?.email, avatar });
    setSaving(false);
    if (!result.success) {
      setErrors({ [result.field || 'name']: result.message });
      return;
    }
    setUser(result.user);
    setErrors({});
    setToast('Đã lưu thay đổi hồ sơ.');
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Thông tin cá nhân" onBack={() => router.back()} />
      {!user ? (
        <View style={styles.content}><LoadingSkeleton height={420} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card style={styles.avatarCard}>
            <View style={styles.avatarLarge}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Ionicons name="person" size={44} color={colors.primary} />}
            </View>
            <Text style={styles.avatarTitle}>Ảnh đại diện demo</Text>
            <Text style={styles.helper}>Chọn một ảnh bên dưới. Thay đổi sẽ hiển thị tại trang chủ, tài khoản và các đánh giá của bạn.</Text>
            <View style={styles.avatarOptions}>
              {avatarOptions.map((uri) => (
                <Pressable key={uri} onPress={() => setAvatar(uri)} style={[styles.avatarOption, avatar === uri && styles.avatarOptionActive]}>
                  <Image source={{ uri }} style={styles.avatarOptionImage} />
                  {avatar === uri ? <View style={styles.selected}><Ionicons name="checkmark" size={14} color={colors.white} /></View> : null}
                </Pressable>
              ))}
            </View>
          </Card>

          <TextField
            label="Họ và tên"
            value={name}
            onChangeText={(value) => { setName(value); setErrors({}); }}
            icon="person-outline"
            error={errors.name}
            placeholder="Nhập họ và tên"
            maxLength={60}
          />
          <TextField
            label="Email"
            value={user.email}
            icon="mail-outline"
            disabled
          />
          <Text style={styles.readonlyHint}>Email đăng nhập không thể thay đổi trong bản demo.</Text>

          <Card style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Vai trò</Text>
              <StatusBadge status="active" label={user.role === 'admin' ? 'Quản trị viên' : user.role === 'author' ? 'Tác giả' : 'Thành viên'} />
            </View>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ngày tạo tài khoản</Text>
              <Text style={styles.metaValue}>{user.createdAt ? formatDisplayDate(user.createdAt) : '01/01/2025 · Demo'}</Text>
            </View>
          </Card>

          <PrimaryButton title="Lưu thay đổi" icon="checkmark-circle-outline" onPress={save} loading={saving} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      )}
      <Toast visible={Boolean(toast)} message={toast} type="success" onDismiss={() => setToast('')} />
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  avatarCard: { alignItems: 'center', marginBottom: spacing.xl },
  avatarLarge: { width: 94, height: 94, borderRadius: 47, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarTitle: { ...typography.title, color: colors.text, marginTop: spacing.md },
  helper: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.xs },
  avatarOptions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  avatarOption: { width: 54, height: 54, borderRadius: 27, padding: 2, borderWidth: 2, borderColor: 'transparent' },
  avatarOptionActive: { borderColor: colors.primary },
  avatarOptionImage: { width: '100%', height: '100%', borderRadius: 24 },
  selected: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  readonlyHint: { ...typography.caption, color: colors.outline, marginTop: -spacing.sm, marginBottom: spacing.xl },
  metaCard: { gap: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  metaLabel: { ...typography.body, color: colors.muted },
  metaValue: { ...typography.body, color: colors.text, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.borderLight },
});
