import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';

export default function Share() {
  const router = useRouter();
  const apps = [
    ['logo-facebook','Facebook'], ['chatbubble-ellipses','Messenger'], ['paper-plane','Zalo'], ['logo-instagram','Instagram'], ['link','Sao chép']
  ];
  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Chia sẻ truyện" onBack={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.title}>Hành Trình Qua Những Vì Sao</Text>
        <Text style={styles.desc}>Chọn nền tảng để chia sẻ truyện hoặc xem trước thẻ chia sẻ.</Text>
        <View style={styles.grid}>
          {apps.map(([icon, name]) => (
            <Pressable key={name} onPress={() => Alert.alert('Chia sẻ demo', `Đã chọn ${name}`)} style={styles.app}>
              <Ionicons name={icon} size={30} color={colors.primary} />
              <Text style={styles.appText}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Xem trước thẻ chia sẻ" icon="eye" onPress={() => router.push('/xem-truoc-chia-se')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  desc: { color: colors.muted, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 28 },
  app: { width: 100, height: 100, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  appText: { color: colors.muted, fontWeight: '800', marginTop: 8, fontSize: 12 }
});
