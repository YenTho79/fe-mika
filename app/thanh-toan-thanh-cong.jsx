import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Screen } from '../components/UI';
import { colors } from '../constants/theme';

export default function PaymentSuccess() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.iconBox}><Ionicons name="checkmark-circle" size={86} color={colors.primary} /></View>
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.desc}>Bạn đã nạp thành công 550 Xu vào tài khoản. Khám phá ngay các đầu sách mới nhất!</Text>
        <Card style={{ width: '100%', marginVertical: 28 }}>
          <Text style={styles.small}>Số dư hiện tại</Text>
          <Text style={styles.balance}>1,250 <Text style={{ fontSize: 24 }}>Xu</Text></Text>
          <View style={styles.row}><Text style={styles.desc}>Mã giao dịch:</Text><Text style={styles.code}>#LMN-98231-TX</Text></View>
        </Card>
        <Button title="Tiếp tục đọc truyện" onPress={() => router.replace('/chi-tiet')} style={{ width: '100%' }} />
        <Button title="Xem tài khoản" variant="outline" onPress={() => router.replace('/tai-khoan')} style={{ width: '100%', marginTop: 12 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  desc: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
  small: { color: colors.muted, fontWeight: '900', textTransform: 'uppercase' },
  balance: { color: colors.primary, fontSize: 52, fontWeight: '900', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12 },
  code: { color: colors.text, fontWeight: '900' }
});
