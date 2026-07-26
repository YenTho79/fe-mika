import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, Share as NativeShare, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Button, ErrorState, LoadingSkeleton, Screen } from '../components/UI';
import { colors, radius, shadow, spacing, typography } from '../constants/theme';
import { getBookById } from '../services/localDataService';
import { buildBookShareText } from '../services/shareService';

const QUOTES = [
  'Mỗi trang sách là một chuyến phiêu lưu mới.',
  'Mình đang đọc truyện này trên Mika Books!',
  'Một câu chuyện hay xứng đáng được chia sẻ.',
];

function FakeQr({ seed }) {
  const cells = Array.from({ length: 100 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 1;
    const row = Math.floor(index / 10);
    const column = index % 10;
    const finder = (row < 3 && column < 3) || (row < 3 && column > 6) || (row > 6 && column < 3);
    return finder || (code + index * 7 + row * 3) % 5 < 2;
  });
  return <View style={styles.qr}>{cells.map((dark, index) => <View key={index} style={[styles.qrCell, dark && styles.qrDark]} />)}</View>;
}

export default function SharePreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.bookId || params.id || 'b1';
  const layout = params.layout === 'horizontal' ? 'horizontal' : 'vertical';
  const quote = QUOTES[Math.max(0, Math.min(QUOTES.length - 1, Number(params.quote) || 0))];
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getBookById(bookId).then(setBook).finally(() => setLoading(false)); }, [bookId]);
  const shareText = useMemo(() => book ? buildBookShareText(book, quote) : '', [book, quote]);

  const copyText = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      Alert.alert('Đã sao chép', 'Nội dung giới thiệu đã sẵn sàng.');
    } else {
      await NativeShare.share({ message: shareText });
    }
  };

  if (loading) return <Screen><LoadingSkeleton height={460} style={{ marginTop: spacing.xxl }} /></Screen>;
  if (!book) return <Screen><ErrorState title="Không tìm thấy truyện" onRetry={() => router.back()} /></Screen>;

  const info = (
    <View style={styles.info}>
      <Text style={styles.quote}>“{quote}”</Text>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>Tác giả: {book.author}</Text>
      <View style={styles.qrRow}><FakeQr seed={String(book.id)} /><Text style={styles.scan}>Quét để đọc trên{`\n`}Mika Books</Text></View>
    </View>
  );

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Xem trước chia sẻ" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.wrapper}>
        {layout === 'vertical' ? (
          <ImageBackground source={{ uri: book.cover }} imageStyle={{ borderRadius: radius.xl }} style={styles.verticalCard}>
            <View style={styles.overlay}>
              <View style={styles.brand}><Ionicons name="book" color={colors.white} size={20} /><Text style={styles.brandText}>Mika Books</Text></View>
              {info}
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.horizontalCard}>
            <Image source={{ uri: book.cover }} style={styles.horizontalCover} />
            <View style={styles.horizontalBody}>
              <View style={styles.brand}><Ionicons name="book" color={colors.primary} size={18} /><Text style={[styles.brandText, { color: colors.primary }]}>Mika Books</Text></View>
              {info}
            </View>
          </View>
        )}
        <Button title="Chia sẻ thẻ" icon="share-social-outline" onPress={() => NativeShare.share({ message: shareText })} style={styles.action} />
        <Button title="Sao chép nội dung" icon="copy-outline" variant="outline" onPress={copyText} style={styles.actionSecondary} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xxxl },
  verticalCard: { width: '100%', maxWidth: 390, aspectRatio: 9 / 14, ...shadow },
  overlay: { flex: 1, borderRadius: radius.xl, padding: spacing.xl, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)' },
  horizontalCard: { width: '100%', maxWidth: 620, minHeight: 310, flexDirection: 'row', borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, ...shadow },
  horizontalCover: { width: '39%', minHeight: 310, backgroundColor: colors.surface3 },
  horizontalBody: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandText: { color: colors.white, fontWeight: '900', fontSize: 18 },
  info: { backgroundColor: 'rgba(11,19,38,0.88)', borderRadius: radius.lg, padding: spacing.lg },
  quote: { ...typography.body, color: colors.primary, fontStyle: 'italic', marginBottom: spacing.md },
  title: { ...typography.heading, color: colors.text },
  author: { ...typography.body, color: colors.tertiary, fontWeight: '800', marginTop: spacing.xs },
  qrRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  qr: { width: 72, height: 72, padding: 6, backgroundColor: colors.white, flexDirection: 'row', flexWrap: 'wrap' },
  qrCell: { width: 6, height: 6, backgroundColor: colors.white },
  qrDark: { backgroundColor: '#101010' },
  scan: { ...typography.caption, color: colors.muted, flex: 1, lineHeight: 18 },
  action: { width: '100%', maxWidth: 620, marginTop: spacing.xl },
  actionSecondary: { width: '100%', maxWidth: 620, marginTop: spacing.md },
});
