import { useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, Screen } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const coin = Math.max(0, Number(params.coin) || 0);
  const bonus = Math.max(0, Number(params.bonus) || 0);
  const price = Math.max(0, Number(params.price) || 0);
  const method = String(params.method || 'MoMo');
  const transactionId = useRef(`MIKA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`).current;
  const [confirmed, setConfirmed] = useState(false);

  const pay = () => router.replace({
    pathname: '/thanh-toan-thanh-cong',
    params: {
      transactionId,
      coin,
      bonus,
      price,
      method,
      returnBookId: params.returnBookId || '',
      returnChapterId: params.returnChapterId || '',
    },
  });

  if (!coin || !price) {
    return <Screen><View style={styles.invalid}><Ionicons name="alert-circle-outline" size={56} color={colors.danger} /><Text style={styles.title}>Gói nạp không hợp lệ</Text><Button title="Chọn lại gói xu" onPress={() => router.replace('/nap-xu')} style={{ marginTop: spacing.xl }} /></View></Screen>;
  }

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Xác nhận thanh toán" onBack={() => router.back()} rightIcon="shield-checkmark-outline" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.small}>CHI TIẾT ĐƠN HÀNG</Text>
          <View style={styles.rowEnd}><Text style={styles.title}>{coin.toLocaleString('vi-VN')} Xu {bonus ? `(+${bonus} tặng)` : ''}</Text><Ionicons name="sparkles" size={34} color={colors.primary} /></View>
          <Text style={styles.desc}>Tổng cộng {Number(coin + bonus).toLocaleString('vi-VN')} xu sẽ được cộng vào tài khoản local sau khi xác nhận.</Text>
          <View style={styles.line} />
          <View style={styles.row}><Text style={styles.desc}>Giá gói</Text><Text style={styles.text}>{formatMoney(price)}</Text></View>
          <View style={styles.row}><Text style={styles.desc}>Xu thưởng</Text><Text style={styles.green}>+{bonus.toLocaleString('vi-VN')} xu</Text></View>
          <View style={styles.row}><Text style={styles.total}>Tổng thanh toán</Text><Text style={styles.price}>{formatMoney(price)}</Text></View>
        </Card>

        <Text style={styles.section}>PHƯƠNG THỨC ĐÃ CHỌN</Text>
        <Card style={styles.method}>
          <View style={styles.methodIcon}><Text style={styles.methodLetter}>{method === 'MoMo' ? 'M' : method.charAt(0)}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.text}>{method}</Text><Text style={styles.desc}>Thanh toán mô phỏng, không trừ tiền thật</Text></View>
          <Ionicons name="checkmark-circle" color={colors.primary} size={26} />
        </Card>

        <Pressable onPress={() => setConfirmed((current) => !current)} style={[styles.confirmBox, confirmed && styles.confirmedBox]}>
          <Ionicons name={confirmed ? 'checkbox' : 'square-outline'} color={colors.primary} size={24} />
          <Text style={styles.confirmText}>Tôi hiểu đây là giao dịch mô phỏng, không phát sinh thanh toán thật.</Text>
        </Pressable>
        <View style={styles.safe}><Ionicons name="information-circle-outline" color={colors.tertiary} size={22} /><Text style={styles.safeText}>Dữ liệu gói xu và giao dịch chỉ được lưu trên thiết bị này.</Text></View>
        <Button title={`Xác nhận nạp ${Number(coin + bonus).toLocaleString('vi-VN')} xu`} icon="checkmark-circle-outline" disabled={!confirmed} onPress={pay} style={{ marginTop: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  invalid: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  small: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  rowEnd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  title: { ...typography.heading, color: colors.text, flex: 1 },
  desc: { ...typography.body, color: colors.muted },
  line: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, gap: spacing.md },
  text: { color: colors.text, fontWeight: '800', fontSize: 16 },
  green: { color: colors.tertiary, fontWeight: '900' },
  total: { color: colors.text, fontSize: 19, fontWeight: '900' },
  price: { color: colors.primary, fontSize: 19, fontWeight: '900' },
  section: { color: colors.muted, fontWeight: '900', letterSpacing: 1, marginTop: spacing.xxl, marginBottom: spacing.md },
  method: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderColor: colors.primary },
  methodIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: '#a50064', alignItems: 'center', justifyContent: 'center' },
  methodLetter: { color: colors.white, fontWeight: '900' },
  confirmBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.lg, marginTop: spacing.xl },
  confirmedBox: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.12)' },
  confirmText: { ...typography.body, color: colors.text, flex: 1 },
  safe: { flexDirection: 'row', gap: spacing.sm, backgroundColor: 'rgba(78,222,163,0.1)', padding: spacing.md, borderRadius: radius.lg, marginTop: spacing.md },
  safeText: { ...typography.caption, color: colors.tertiary, flex: 1 },
});
