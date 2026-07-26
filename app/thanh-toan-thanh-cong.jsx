import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ErrorState, LoadingSkeleton, Screen } from '../components/UI';
import { colors, spacing, typography } from '../constants/theme';
import { completeCoinTopup, getCurrentUser } from '../services/localDataService';

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const startedRef = useRef(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const coin = Math.max(0, Number(params.coin) || 0);
  const bonus = Math.max(0, Number(params.bonus) || 0);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Không tìm thấy tài khoản đang đăng nhập.');
        const completed = await completeCoinTopup({
          transactionId: params.transactionId,
          userId: user.id,
          coin,
          bonus,
          price: params.price,
          method: params.method,
        });
        setResult(completed);
      } catch (completeError) {
        setError(completeError.message || 'Không thể hoàn tất giao dịch.');
      }
    })();
  }, [bonus, coin, params.method, params.price, params.transactionId]);

  const retry = () => router.replace('/nap-xu');
  const continueReading = () => {
    if (params.returnBookId) {
      router.replace({ pathname: '/doc-sach', params: { bookId: params.returnBookId, chapter: params.returnChapterId || '' } });
    } else {
      router.replace('/trang-chu');
    }
  };

  if (error) return <Screen><ErrorState title="Giao dịch chưa hoàn tất" message={error} onRetry={retry} /></Screen>;
  if (!result) return <Screen><View style={styles.loading}><LoadingSkeleton width={110} height={110} borderRadius={55} /><LoadingSkeleton width={260} height={34} style={{ marginTop: spacing.xl }} /><Text style={styles.loadingText}>Đang cộng xu vào tài khoản...</Text></View></Screen>;

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.iconBox}><Ionicons name="checkmark-circle" size={86} color={colors.tertiary} /></View>
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.desc}>Tài khoản đã được cộng {Number(coin + bonus).toLocaleString('vi-VN')} xu từ giao dịch mô phỏng.</Text>
        <Card style={styles.resultCard}>
          <Text style={styles.small}>Số dư mới</Text>
          <Text style={styles.balance}>{Number(result.balance).toLocaleString('vi-VN')} <Text style={styles.coinUnit}>Xu</Text></Text>
          <View style={styles.row}><Text style={styles.desc}>Mã giao dịch</Text><Text style={styles.code} numberOfLines={1}>{result.transaction.id}</Text></View>
          <View style={styles.row}><Text style={styles.desc}>Phương thức</Text><Text style={styles.value}>{result.transaction.method}</Text></View>
        </Card>
        <Button title={params.returnBookId ? 'Quay lại chương đang đọc' : 'Về trang chủ'} onPress={continueReading} style={styles.button} />
        <Button title="Xem tài khoản" variant="outline" onPress={() => router.replace('/tai-khoan')} style={[styles.button, { marginTop: spacing.md }]} />
        <Button title="Xem lịch sử giao dịch" variant="outline" onPress={() => router.replace('/lich-su-giao-dich')} style={[styles.button, { marginTop: spacing.md }]} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.muted, marginTop: spacing.lg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  iconBox: { width: 132, height: 132, borderRadius: 66, backgroundColor: 'rgba(78,222,163,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { ...typography.display, color: colors.text, textAlign: 'center' },
  desc: { ...typography.body, color: colors.muted, textAlign: 'center' },
  resultCard: { width: '100%', marginVertical: spacing.xxl },
  small: { ...typography.caption, color: colors.muted, fontWeight: '900', textTransform: 'uppercase' },
  balance: { color: colors.primary, fontSize: 48, fontWeight: '900', marginVertical: spacing.sm },
  coinUnit: { fontSize: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing.md, marginTop: spacing.md },
  code: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  value: { color: colors.text, fontWeight: '800' },
  button: { width: '100%' },
});
