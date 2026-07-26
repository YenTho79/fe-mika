import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, Screen } from '../components/UI';
import { books } from '../data/books';
import { colors, shadow } from '../constants/theme';

export default function SharePreview() {
  const router = useRouter();
  const book = books[0];
  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Xem trước chia sẻ" onBack={() => router.back()} rightIcon="share-social" />
      <View style={styles.wrapper}>
        <ImageBackground source={{ uri: book.cover }} imageStyle={{ borderRadius: 32 }} style={styles.card}>
          <View style={styles.overlay}>
            <View style={styles.brand}><Ionicons name="book" color="#ede0ff" size={20} /><Text style={styles.brandText}>Mika Books</Text></View>
            <View style={styles.info}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>Tác giả: {book.author}</Text>
              <Text style={styles.desc}>{book.description}</Text>
              <View style={styles.row}><Text style={styles.star}>★★★★★</Text><Text style={styles.rating}>4.9 (1.2k đánh giá)</Text></View>
            </View>
          </View>
        </ImageBackground>
        <Button title="Quay lại chi tiết" onPress={() => router.replace('/chi-tiet')} style={{ marginTop: 20, width: '100%' }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', aspectRatio: 9 / 16, ...shadow },
  overlay: { flex: 1, borderRadius: 32, padding: 24, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.25)' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { color: colors.primary, fontWeight: '900', fontSize: 20 },
  info: { backgroundColor: 'rgba(23,31,51,0.78)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  author: { color: colors.tertiary, fontWeight: '800', marginTop: 5 },
  desc: { color: colors.muted, lineHeight: 21, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  star: { color: colors.tertiary, fontWeight: '900' },
  rating: { color: colors.muted, fontSize: 12 }
});
