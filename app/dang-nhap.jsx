import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, PasswordField, PrimaryButton, Screen, SecondaryButton, TextField } from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { getRememberedEmail, login } from '../services/localDataService';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRememberedEmail().then((rememberedEmail) => {
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRemember(true);
      }
    });
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
    router.replace(result.user.role === 'admin' ? '/admin' : '/trang-chu');
  };

  const fillAdminDemo = () => {
    setEmail('admin@mika.vn');
    setPassword('admin123');
    setErrors({});
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Ionicons name="book" size={36} color={colors.white} /></View>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.description}>Đăng nhập để tiếp tục hành trình đọc sách cùng Mika.</Text>

          <Card style={styles.card}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(value) => { setEmail(value); setErrors((current) => ({ ...current, email: '' })); }}
              placeholder="ban@mika.vn"
              icon="mail-outline"
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <PasswordField
              value={password}
              onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: '' })); }}
              error={errors.password}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <Pressable onPress={() => setRemember((value) => !value)} style={styles.rememberRow}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember ? <Ionicons name="checkmark" size={15} color={colors.white} /> : null}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ email đăng nhập</Text>
            </Pressable>
            <PrimaryButton title="Đăng nhập" icon="book-outline" onPress={handleLogin} loading={loading} />
            <SecondaryButton title="Tạo tài khoản" onPress={() => router.push('/dang-ky')} style={{ marginTop: spacing.md }} />
            <SecondaryButton title="Điền tài khoản Admin demo" icon="shield-checkmark-outline" onPress={fillAdminDemo} style={{ marginTop: spacing.md }} />
          </Card>

          <Text style={styles.demo}>User demo: user@mika.vn / 12345678</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  logo: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { ...typography.display, color: colors.text, textAlign: 'center' },
  description: { ...typography.body, color: colors.muted, textAlign: 'center', marginTop: spacing.sm, maxWidth: 360 },
  card: { width: '100%', maxWidth: 440, marginTop: spacing.xxl },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, alignSelf: 'flex-start' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkboxActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  rememberText: { ...typography.body, color: colors.muted },
  demo: { ...typography.caption, color: colors.outline, marginTop: spacing.lg, textAlign: 'center' },
});
