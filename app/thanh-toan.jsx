import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const coin = params.coin || 500;
  const bonus = params.bonus || 50;
  const price = params.price || '100.000đ';
  const method = params.method || 'MoMo';

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Thanh toán" onBack={() => router.back()} rightIcon="shield-checkmark" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={styles.small}>CHI TIẾT ĐƠN HÀNG</Text>
          <View style={styles.rowEnd}>
            <Text style={styles.title}>{coin} Xu {bonus ? `(+${bonus} tặng)` : ''}</Text>
            <Ionicons name="sparkles" size={34} color={colors.primary} />
          </View>
          <Text style={styles.desc}>Gói nạp Mika VIP - Tự động cập nhật vào tài khoản sau khi thanh toán.</Text>
          <View style={styles.line} />
          <View style={styles.row}><Text style={styles.desc}>Giá niêm yết</Text><Text style={styles.text}>{price}</Text></View>
          <View style={styles.row}><Text style={styles.desc}>Khuyến mãi</Text><Text style={styles.green}>-0đ</Text></View>
          <View style={styles.row}><Text style={styles.total}>Tổng thanh toán</Text><Text style={styles.price}>{price}</Text></View>
        </Card>

        <Text style={styles.section}>Phương thức thanh toán</Text>
        <Card style={styles.method}>
          <View style={styles.methodIcon}><Text style={{ color: '#fff', fontWeight: '900' }}>{method === 'MoMo' ? 'M' : method[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.text}>{method}</Text>
            <Text style={styles.desc}>Giao dịch demo cho Frontend</Text>
          </View>
          <Ionicons name="checkmark-circle" color={colors.primary} size={26} />
        </Card>

        <View style={styles.safe}><Ionicons name="lock-closed" color={colors.tertiary} size={22} /><Text style={styles.safeText}>Giao dịch an toàn & bảo mật bởi Mika Secure.</Text></View>
        <Button title="Thanh toán ngay" icon="chevron-forward" onPress={() => router.replace('/thanh-toan-thanh-cong')} style={{ marginTop: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  small: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  rowEnd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', flex: 1 },
  desc: { color: colors.muted, lineHeight: 22 },
  line: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  text: { color: colors.text, fontWeight: '800', fontSize: 16 },
  green: { color: colors.tertiary, fontWeight: '900' },
  total: { color: colors.text, fontSize: 20, fontWeight: '900' },
  price: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  section: { color: colors.muted, fontWeight: '900', letterSpacing: 1, marginTop: 26, marginBottom: 12 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: colors.primary },
  methodIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#A50064', alignItems: 'center', justifyContent: 'center' },
  safe: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(78,222,163,0.1)', padding: 14, borderRadius: 16, marginTop: 18 },
  safeText: { color: colors.tertiary, flex: 1, lineHeight: 20 }
});
