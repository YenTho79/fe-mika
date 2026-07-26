import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, Screen } from '../components/UI';
import { coinPackages } from '../data/books';
import { colors } from '../constants/theme';

export default function Topup() {
  const router = useRouter();
  const [selected, setSelected] = useState(2);
  const [method, setMethod] = useState('MoMo');
  const pack = coinPackages.find(p => p.id === selected);

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Nạp xu" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Card style={styles.balance}>
          <View>
            <Text style={styles.muted}>Số dư hiện tại</Text>
            <Text style={styles.balanceText}>500 Xu</Text>
          </View>
          <Ionicons name="wallet" size={34} color={colors.primary} />
        </Card>

        <Text style={styles.section}>Chọn gói nạp</Text>
        {coinPackages.map(p => (
          <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[styles.package, selected === p.id && styles.packageActive]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name={p.id === 3 ? 'diamond' : 'cash'} size={24} color={selected === p.id ? '#fff' : colors.primary} />
              <View>
                <Text style={[styles.packageTitle, selected === p.id && styles.activeText]}>{p.coin} Xu {p.bonus ? `+${p.bonus}` : ''}</Text>
                <Text style={[styles.muted, selected === p.id && { color: 'rgba(255,255,255,0.8)' }]}>{p.bonus ? `Tặng thêm ${Math.round(p.bonus / p.coin * 100)}%` : 'Gói cơ bản'}</Text>
              </View>
            </View>
            <Text style={[styles.price, selected === p.id && styles.activeText]}>{p.price}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Phương thức thanh toán</Text>
        {['MoMo','ZaloPay','ATM / Visa'].map(m => (
          <Pressable key={m} onPress={() => setMethod(m)} style={styles.method}>
            <Text style={styles.packageTitle}>{m}</Text>
            <Ionicons name={method === m ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={24} />
          </Pressable>
        ))}

        <Button title={`Tiếp tục thanh toán ${pack?.price || ''}`} icon="chevron-forward" onPress={() => router.push({ pathname: '/thanh-toan', params: { coin: pack.coin, bonus: pack.bonus, price: pack.price, method } })} style={{ marginTop: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { color: colors.muted },
  balanceText: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  section: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 26, marginBottom: 12 },
  package: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  packageActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, transform: [{ scale: 1.01 }] },
  packageTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  price: { color: colors.primary, fontWeight: '900', fontSize: 17 },
  activeText: { color: '#fff' },
  method: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }
});
