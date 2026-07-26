import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Card, PasswordField, PrimaryButton, Screen, TextField } from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { registerUser } from '../services/localDataService';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const passwordScore = [
    form.password.length >= 8,
    /[a-z]/.test(form.password) && /[A-Z]/.test(form.password),
    /\d/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length;
  const passwordLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  const handleRegister = async () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Email chưa đúng định dạng.';
    if (form.password.length < 8) nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const result = await registerUser(form);
    setLoading(false);
    if (!result.success) {
      setErrors({ email: result.message });
      return;
    }
    router.replace('/trang-chu');
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Tạo tài khoản" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Gia nhập Mika Books</Text>
          <Text style={styles.description}>Thông tin được lưu ngay trên thiết bị cho bản demo local.</Text>
          <Card style={styles.card}>
            <TextField label="Họ và tên" value={form.name} onChangeText={update('name')} icon="person-outline" error={errors.name} />
            <TextField label="Email" value={form.email} onChangeText={update('email')} icon="mail-outline" error={errors.email} autoCapitalize="none" keyboardType="email-address" />
            <PasswordField value={form.password} onChangeText={update('password')} error={errors.password} />
            {form.password ? (
              <View style={styles.strengthBlock}>
                <View style={styles.strengthTrack}>
                  {[1, 2, 3, 4].map((level) => (
                    <View key={level} style={[styles.strengthSegment, passwordScore >= level && styles.strengthSegmentActive]} />
                  ))}
                </View>
                <Text style={styles.strengthText}>Độ mạnh: {passwordLabels[passwordScore]}</Text>
              </View>
            ) : null}
            <PasswordField label="Xác nhận mật khẩu" value={form.confirmPassword} onChangeText={update('confirmPassword')} error={errors.confirmPassword} />
            <PrimaryButton title="Đăng ký" icon="person-add-outline" onPress={handleRegister} loading={loading} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  card: { marginTop: spacing.xl },
  strengthBlock: { marginTop: -spacing.sm, marginBottom: spacing.lg },
  strengthTrack: { flexDirection: 'row', gap: spacing.xs },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surface3 },
  strengthSegmentActive: { backgroundColor: colors.tertiary },
  strengthText: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
});
