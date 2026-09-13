import { useMemo, useTheme } from '../hooks/useTheme';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, PasswordField, PrimaryButton, Screen, SecondaryButton, TextField } from '../components/UI';
import { spacing, typography } from '../constants/theme';
import { getRememberedEmail, login } from '../services/localDataService';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  getBiometricTypeName,
  getBiometricIcon,
  enableBiometric,
  authenticateWithBiometric,
  getBiometricCredentials,
} from '../services/biometricService';

export default function Login() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('Sinh trắc học');
  const [biometricIcon, setBiometricIcon] = useState('finger-print');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  // Animation cho nút biometric
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation cho nút biometric
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    async function initBiometric() {
      const [rememberedEmail, available, enabled, typeName, icon] = await Promise.all([
        getRememberedEmail(),
        isBiometricAvailable(),
        isBiometricEnabled(),
        getBiometricTypeName(),
        getBiometricIcon(),
      ]);

      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRemember(true);
      }

      setBiometricAvailable(available);
      setBiometricEnabled(enabled && available);
      setBiometricTypeName(typeName);
      setBiometricIcon(icon);
    }
    initBiometric();
  }, []);

  const handleLogin = async () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Vui lòng nhập email.';
    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const result = await login(email, password, remember);
    setLoading(false);

    if (!result.success) {
      setErrors({ [result.field || 'password']: result.message });
      return;
    }

    // Đăng nhập thành công: hỏi bật biometric nếu chưa bật và có phần cứng
    if (biometricAvailable && !biometricEnabled) {
      setPendingCredentials({ email: email.trim(), password });
      setShowEnableDialog(true);
      return;
    }

    router.replace(result.user.role === 'admin' ? '/admin' : '/trang-chu');
  };

  const handleEnableBiometric = async () => {
    setShowEnableDialog(false);
    if (pendingCredentials) {
      await enableBiometric(pendingCredentials.email, pendingCredentials.password);
      setBiometricEnabled(true);
    }
    const currentUser = await import('../services/localDataService').then(m => m.getCurrentUser());
    router.replace(currentUser?.role === 'admin' ? '/admin' : '/trang-chu');
  };

  const handleSkipBiometric = () => {
    setShowEnableDialog(false);
    setPendingCredentials(null);
    import('../services/localDataService').then(m => m.getCurrentUser()).then(user => {
      router.replace(user?.role === 'admin' ? '/admin' : '/trang-chu');
    });
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    const authResult = await authenticateWithBiometric(`Đăng nhập bằng ${biometricTypeName}`);
    setBiometricLoading(false);

    if (!authResult.success) {
      if (authResult.isFallback) return; // user chọn dùng password, không cần thông báo
      setErrors({ password: authResult.error });
      return;
    }

    const credentials = await getBiometricCredentials();
    if (!credentials) {
      setErrors({ password: 'Không tìm thấy thông tin đăng nhập đã lưu. Vui lòng đăng nhập lại bằng mật khẩu.' });
      return;
    }

    setLoading(true);
    const result = await login(credentials.email, credentials.password, true);
    setLoading(false);

    if (!result.success) {
      setErrors({ password: result.message });
      return;
    }

    router.replace(result.user.role === 'admin' ? '/admin' : '/trang-chu');
  };

  const fillAdminDemo = () => {
    setEmail('admin@mika.vn');
    setPassword('admin123');
    setErrors({});
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Ionicons name="book" size={36} color={colors.white} /></View>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.description}>Đăng nhập để tiếp tục hành trình đọc sách cùng Mika.</Text>

          {/* Nút đăng nhập sinh trắc học */}
          {biometricAvailable && biometricEnabled && (
            <Animated.View style={[styles.biometricWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <Pressable
                style={({ pressed }) => [styles.biometricButton, pressed && styles.biometricButtonPressed]}
                onPress={handleBiometricLogin}
                disabled={biometricLoading}
              >
                <View style={styles.biometricIconCircle}>
                  <Ionicons name={biometricIcon} size={34} color={colors.primary} />
                </View>
                <Text style={styles.biometricText}>
                  {biometricLoading ? 'Đang xác thực...' : `Đăng nhập bằng ${biometricTypeName}`}
                </Text>
                <Text style={styles.biometricSub}>Chạm để xác thực ngay</Text>
              </Pressable>
            </Animated.View>
          )}

          <Card style={styles.card}>
            {biometricAvailable && biometricEnabled && (
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc đăng nhập bằng mật khẩu</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            <TextField
              label="Email"
              value={email}
              onChangeText={(value) => { setEmail(value); setErrors((c) => ({ ...c, email: '' })); }}
              placeholder="ban@mika.vn"
              icon="mail-outline"
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <PasswordField
              value={password}
              onChangeText={(value) => { setPassword(value); setErrors((c) => ({ ...c, password: '' })); }}
              error={errors.password}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <Pressable onPress={() => setRemember((v) => !v)} style={styles.rememberRow}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember ? <Ionicons name="checkmark" size={15} color={colors.white} /> : null}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ email đăng nhập</Text>
            </Pressable>
            <PrimaryButton title="Đăng nhập" icon="book-outline" onPress={handleLogin} loading={loading} />
            <SecondaryButton title="Tạo tài khoản" onPress={() => router.push('/dang-ky')} style={{ marginTop: spacing.md }} />
            <SecondaryButton title="Điền tài khoản Admin demo" icon="shield-checkmark-outline" onPress={fillAdminDemo} style={{ marginTop: spacing.md }} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialog hỏi bật sinh trắc học sau khi đăng nhập thành công */}
      <Modal
        visible={showEnableDialog}
        transparent
        animationType="fade"
        onRequestClose={handleSkipBiometric}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name={biometricIcon} size={40} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Bật đăng nhập {biometricTypeName}?</Text>
            <Text style={styles.modalDesc}>
              Đăng nhập nhanh hơn ở những lần tiếp theo mà không cần nhập mật khẩu. Bạn có thể tắt tính năng này trong Cài đặt bất kỳ lúc nào.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.modalBtnPrimary, pressed && { opacity: 0.85 }]}
              onPress={handleEnableBiometric}
            >
              <Ionicons name={biometricIcon} size={20} color={colors.white} />
              <Text style={styles.modalBtnPrimaryText}>Bật {biometricTypeName}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalBtnSecondary, pressed && { opacity: 0.7 }]}
              onPress={handleSkipBiometric}
            >
              <Text style={styles.modalBtnSecondaryText}>Không, tiếp tục</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, paddingBottom: Platform.OS === 'android' ? 60 : spacing.xl },
  logo: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { ...typography.display, color: colors.text, textAlign: 'center' },
  description: { ...typography.body, color: colors.muted, textAlign: 'center', marginTop: spacing.sm, maxWidth: 360 },
  card: { width: '100%', maxWidth: 440, marginTop: spacing.xxl },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, alignSelf: 'flex-start' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkboxActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  rememberText: { ...typography.body, color: colors.muted },
  demo: { ...typography.caption, color: colors.outline, marginTop: spacing.lg, textAlign: 'center' },

  // Biometric button
  biometricWrapper: { width: '100%', maxWidth: 440, marginTop: spacing.xxl },
  biometricButton: {
    backgroundColor: colors.surface2 || colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary + '50',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  biometricButtonPressed: { opacity: 0.8, borderColor: colors.primary },
  biometricIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  biometricText: { ...typography.title, color: colors.text, fontWeight: '700', textAlign: 'center' },
  biometricSub: { ...typography.caption, color: colors.muted, textAlign: 'center' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.outline + '30' },
  dividerText: { ...typography.caption, color: colors.muted },

  // Enable dialog
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  modalIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary + '18',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: { ...typography.title, color: colors.text, fontWeight: '800', textAlign: 'center' },
  modalDesc: { ...typography.body, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  modalBtnPrimary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  modalBtnPrimaryText: { ...typography.body, color: colors.white, fontWeight: '700' },
  modalBtnSecondary: { paddingVertical: spacing.md },
  modalBtnSecondaryText: { ...typography.body, color: colors.muted },
});
