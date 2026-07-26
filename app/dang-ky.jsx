import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Pressable, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';
import { registerUser } from '../constants/api';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const checkPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'transparent', score: 0 };
    if (pass.length < 8) return { label: 'Mật khẩu quá ngắn (tối thiểu 8 ký tự)', color: '#ff4d4d', score: 1 };
    
    let score = 0;
    if (/[a-zA-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    
    if (score === 1) {
      return { label: 'Độ bảo mật: Yếu', color: '#ff4d4d', score: 1 };
    } else if (score === 2) {
      return { label: 'Độ bảo mật: Trung bình', color: '#ffa500', score: 2 };
    } else {
      return { label: 'Độ bảo mật: Mạnh', color: '#2ecc71', score: 3 };
    }
  };

  const strength = checkPasswordStrength(password);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      return Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin.');
    }
    if (!validateEmail(email)) {
      return Alert.alert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email (ví dụ: abc@gmail.com).');
    }
    if (password.length < 8) {
      return Alert.alert('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất 8 ký tự.');
    }
    if (password !== confirm) {
      return Alert.alert('Sai mật khẩu', 'Mật khẩu xác nhận chưa khớp.');
    }

    setLoading(true);

    try {
      const result = await registerUser(name, email, password);

      if (result.success) {
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.', [
          { text: 'Đăng nhập ngay', onPress: () => router.replace('/dang-nhap') }
        ]);
      } else {
        Alert.alert('Đăng ký thất bại', result.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối', 'Không thể hoàn tất đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Đăng ký" onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Bắt đầu hành trình đọc</Text>
              <Text style={styles.desc}>Tham gia cộng đồng yêu truyện để lưu dấu trang và nhận thông báo chương mới.</Text>
              <Card style={{ marginTop: 24 }}>
                <TextInput value={name} onChangeText={setName} placeholder="Biệt danh của bạn" placeholderTextColor={colors.outline} style={styles.input} />
                <TextInput value={email} onChangeText={setEmail} placeholder="Nhập email của bạn" placeholderTextColor={colors.outline} style={styles.input} autoCapitalize="none" />
                <View style={styles.passwordBox}>
                  <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" placeholderTextColor={colors.outline} secureTextEntry={!showPassword} style={styles.innerInput} />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
                  </Pressable>
                </View>
                {password.length > 0 && (
                  <View style={{ marginBottom: 12, marginTop: -4 }}>
                    <Text style={{ color: strength.color, fontSize: 12, fontWeight: '700' }}>{strength.label}</Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                    </View>
                  </View>
                )}
                <View style={styles.passwordBox}>
                  <TextInput value={confirm} onChangeText={setConfirm} placeholder="Xác nhận mật khẩu" placeholderTextColor={colors.outline} secureTextEntry={!showConfirm} style={styles.innerInput} />
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eye}>
                    <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
                  </Pressable>
                </View>
                <Button title={loading ? "Đang xử lý..." : "Gia nhập cộng đồng"} icon={loading ? undefined : "book"} onPress={handleRegister} disabled={loading} />
              </Card>
              <Pressable onPress={() => router.replace('/dang-nhap')} style={{ marginTop: 20 }}>
                <Text style={styles.link}>Đã là thành viên? Đăng nhập ngay</Text>
              </Pressable>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  desc: { color: colors.muted, marginTop: 8, lineHeight: 22 },
  input: { ...Platform.select({ web: { outlineStyle: 'none' } }), height: 52, borderRadius: 14, backgroundColor: colors.surface3, color: colors.text, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  passwordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface3, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  innerInput: { ...Platform.select({ web: { outlineStyle: 'none' } }), flex: 1, height: 52, color: colors.text, paddingHorizontal: 14 },
  eye: { paddingHorizontal: 14 },
  link: { color: colors.primary, fontWeight: '800', textAlign: 'center' }
});
