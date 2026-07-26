import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Screen } from '../components/UI';
import { colors } from '../constants/theme';
import { loginUser } from '../constants/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Bạn hãy nhập tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.success && result.user) {
        const userObj = {
          id: result.user.id,
          name: result.user.ho_ten || result.user.email,
          ho_ten: result.user.ho_ten,
          email: result.user.email,
          so_du_xu: result.user.so_du_xu ?? 0,
          api_token: result.user.api_token,
          ngay_tao: result.user.ngay_tao,
        };

        await AsyncStorage.setItem('mika_user', JSON.stringify(userObj));
        router.replace('/trang-chu');
      } else {
        Alert.alert('Đăng nhập thất bại', result.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối', 'Không thể hoàn tất đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={styles.logo}><Ionicons name="book" size={38} color="#ede0ff" /></View>
              <Text style={styles.title}>Chào mừng bạn trở lại</Text>
              <Text style={styles.desc}>Đăng nhập để tiếp tục khám phá những bộ truyện yêu thích của bạn.</Text>

              <Card style={{ width: '100%', marginTop: 30 }}>
                <Text style={styles.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} placeholder="Nhập email của bạn" placeholderTextColor={colors.outline} style={styles.input} autoCapitalize="none" />
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordBox}>
                  <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.outline} secureTextEntry={!showPassword} style={[styles.input, { flex: 1, marginBottom: 0 }]} />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
                  </Pressable>
                </View>
                <Button title={loading ? "Đang đăng nhập..." : "Bắt đầu đọc ngay"} icon={loading ? undefined : "book"} onPress={handleLogin} disabled={loading} style={{ marginTop: 18 }} />
                <Pressable onPress={() => router.push('/register')} style={{ marginTop: 18 }}>
                  <Text style={styles.link}>Bạn chưa có tài khoản? Tham gia ngay</Text>
                </Pressable>
              </Card>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  desc: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  label: { color: colors.muted, fontWeight: '800', marginBottom: 8, marginTop: 12 },
  input: { height: 50, borderRadius: 14, backgroundColor: colors.surface3, color: colors.text, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  passwordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface3, borderRadius: 14 },
  eye: { paddingHorizontal: 14 },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '800' }
});
