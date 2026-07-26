import { useCallback, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, LoadingSkeleton, Screen } from '../components/UI';
import { coinPackages } from '../data/books';
import { colors, radius, spacing, typography } from '../constants/theme';
import { getCurrentUser } from '../services/localDataService';

const paymentMethods = [
  { id: 'MoMo', icon: 'phone-portrait-outline', color: '#a50064' },
  { id: 'ZaloPay', icon: 'flash-outline', color: '#1677ff' },
  { id: 'ATM / Visa', icon: 'card-outline', color: '#0a8f68' },
];

const parsePrice = (price) => Number(String(price).replace(/[^0-9]/g, '')) || 0;

export default function Topup() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState(2);
  const [method, setMethod] = useState('MoMo');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pack = coinPackages.find((item) => item.id === selected) || coinPackages[0];

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getCurrentUser().then(setUser).finally(() => setLoading(false));
  }, []));

  const continuePayment = () => router.push({
    pathname: '/thanh-toan',
    params: {
      coin: pack.coin,
      bonus: pack.bonus,
      price: parsePrice(pack.price),
      priceLabel: pack.price,
      method,
      returnBookId: params.returnBookId || '',
      returnChapterId: params.returnChapterId || '',
    },
  });

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Nạp xu" onBack={() => router.back()} rightIcon="receipt-outline" onRight={() => router.push('/lich-su-giao-dich')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.balance}>
          <View>
            <Text style={styles.muted}>Số dư hiện tại</Text>
            {loading ? <LoadingSkeleton width={120} height={34} style={{ marginTop: spacing.xs }} /> : <Text style={styles.balanceText}>{Number(user?.coinBalance || 0).toLocaleString('vi-VN')} Xu</Text>}
          </View>
          <View style={styles.wallet}><Ionicons name="wallet" size={30} color={colors.primary} /></View>
        </Card>

        <Text style={styles.section}>Chọn gói nạp</Text>
        {coinPackages.map((item) => (
          <Pressable key={item.id} onPress={() => setSelected(item.id)} style={[styles.package, selected === item.id && styles.packageActive]}>
            <View style={styles.packageInfo}>
              <Ionicons name={item.bonus ? 'sparkles' : 'cash-outline'} size={24} color={selected === item.id ? colors.white : colors.primary} />
              <View>
                <Text style={[styles.packageTitle, selected === item.id && styles.activeText]}>{item.coin.toLocaleString('vi-VN')} Xu {item.bonus ? `+ ${item.bonus}` : ''}</Text>
                <Text style={[styles.muted, selected === item.id && styles.activeMuted]}>{item.bonus ? `Tặng thêm ${Math.round(item.bonus / item.coin * 100)}%` : 'Gói cơ bản'}</Text>
              </View>
            </View>
            <Text style={[styles.price, selected === item.id && styles.activeText]}>{item.price}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Phương thức thanh toán</Text>
        {paymentMethods.map((item) => (
          <Pressable key={item.id} onPress={() => setMethod(item.id)} style={[styles.method, method === item.id && styles.methodActive]}>
            <View style={[styles.methodIcon, { backgroundColor: item.color }]}><Ionicons name={item.icon} color={colors.white} size={21} /></View>
            <Text style={styles.packageTitle}>{item.id}</Text>
            <Ionicons name={method === item.id ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={24} />
          </Pressable>
        ))}

        <Button title={`Tiếp tục · ${pack.price}`} icon="chevron-forward" onPress={continuePayment} style={{ marginTop: spacing.xxl }} />
        <Pressable onPress={() => router.push('/lich-su-giao-dich')} style={styles.historyLink}><Ionicons name="time-outline" size={18} color={colors.primary} /><Text style={styles.historyText}>Xem lịch sử giao dịch</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  balance: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wallet: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
  muted: { ...typography.caption, color: colors.muted },
  balanceText: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: spacing.xs },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },
  package: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  packageActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  packageInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  packageTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  price: { color: colors.primary, fontWeight: '900', fontSize: 16 },
  activeText: { color: colors.white },
  activeMuted: { color: 'rgba(255,255,255,0.78)' },
  method: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  methodActive: { borderColor: colors.primary },
  methodIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  historyLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  historyText: { ...typography.body, color: colors.primary, fontWeight: '800' },
});
