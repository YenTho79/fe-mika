import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav, Card, Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Nguyễn Thị Yến Thơ', email: 'frontend@mika.vn' });
  useEffect(() => {
    AsyncStorage.getItem('mika_user').then(data => data && setUser(JSON.parse(data)));
  }, []);

  async function logout() {
    await AsyncStorage.removeItem('mika_user');
    router.replace('/dang-nhap');
  }

  const options = [
    ['person','Thông tin cá nhân','Quản lý danh tính và chi tiết của bạn'],
    ['bookmark','Truyện đã lưu','Danh sách truyện bạn đã đánh dấu'],
    ['time','Lịch sử đọc','Các chương truyện đã đọc gần đây'],
    ['card','Gói hội viên','Quản lý Premium và thanh toán'],
    ['notifications','Cài đặt thông báo','Cảnh báo chương mới và tin nhắn']
  ];

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Tài khoản" onBack={() => router.back()} rightIcon="settings" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.charAt(0) || 'Y'}</Text></View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Text style={styles.groupTitle}>Cài đặt</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {options.map((o, i) => (
            <Pressable 
              key={o[1]} 
              onPress={() => o[1] === 'Truyện đã lưu' ? router.push('/truyen-da-luu') : Alert.alert(o[1], 'Tính năng đang được phát triển trong bản demo.')} 
              style={[styles.option, i !== 0 && styles.borderTop]}
            >
              <View style={styles.optionIcon}><Ionicons name={o[0]} size={22} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{o[1]}</Text><Text style={styles.optionDesc}>{o[2]}</Text></View>
              <Ionicons name="chevron-forward" color={colors.outline} size={20} />
            </Pressable>
          ))}
        </Card>
        <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out" size={20} color={colors.danger} /><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
        <Text style={styles.version}>Phiên bản 1.0.0 - Demo FE</Text>
      </ScrollView>
      <BottomNav router={router} active="account" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 44, fontWeight: '900' },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 12 },
  email: { color: colors.muted, marginTop: 4 },
  groupTitle: { color: colors.outline, fontWeight: '900', textTransform: 'uppercase', marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  borderTop: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  optionIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.22)', alignItems: 'center', justifyContent: 'center' },
  optionTitle: { color: colors.text, fontWeight: '900' },
  optionDesc: { color: colors.muted, marginTop: 3, fontSize: 12 },
  logout: { marginTop: 22, height: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.danger, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  logoutText: { color: colors.danger, fontWeight: '900' },
  version: { color: colors.outline, textAlign: 'center', marginTop: 16 }
});
