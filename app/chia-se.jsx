import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Share as NativeShare, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Button, Card, ErrorState, FilterChip, LoadingSkeleton, Screen } from '../components/UI';
import { colors, radius, spacing, typography } from '../constants/theme';
import { getBookById } from '../services/localDataService';
import { buildBookShareText } from '../services/shareService';

const QUOTES = [
  'Mỗi trang sách là một chuyến phiêu lưu mới.',
  'Mình đang đọc truyện này trên Mika Books!',
  'Một câu chuyện hay xứng đáng được chia sẻ.',
];

async function copyShareText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    Alert.alert('Đã sao chép', 'Nội dung giới thiệu đã được sao chép.');
    return;
  }
  await NativeShare.share({ message: text });
}

export default function ShareBook() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.bookId || params.id || 'b1';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('vertical');
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    getBookById(bookId).then(setBook).finally(() => setLoading(false));
  }, [bookId]);

  const shareText = useMemo(() => book ? buildBookShareText(book, QUOTES[quoteIndex]) : '', [book, quoteIndex]);

  if (loading) return <Screen><LoadingSkeleton height={420} style={{ marginTop: spacing.xxl }} /></Screen>;
  if (!book) return <Screen><ErrorState title="Không tìm thấy truyện" message="Thẻ chia sẻ không thể được tạo." onRetry={() => router.back()} /></Screen>;

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AppHeader title="Tạo thẻ chia sẻ" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.bookSummary}>
          <Image source={{ uri: book.cover }} style={styles.cover} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Kiểu thẻ</Text>
        <View style={styles.chips}>
          <FilterChip label="Thẻ dọc" active={layout === 'vertical'} onPress={() => setLayout('vertical')} />
          <FilterChip label="Thẻ ngang" active={layout === 'horizontal'} onPress={() => setLayout('horizontal')} />
        </View>

        <Text style={styles.sectionTitle}>Câu trích dẫn</Text>
        {QUOTES.map((quote, index) => (
          <Pressable key={quote} onPress={() => setQuoteIndex(index)} style={[styles.quote, quoteIndex === index && styles.quoteActive]}>
            <Ionicons name={quoteIndex === index ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={22} />
            <Text style={styles.quoteText}>{quote}</Text>
          </Pressable>
        ))}

        <Button
          title="Xem trước thẻ"
          icon="eye-outline"
          onPress={() => router.push({ pathname: '/xem-truoc-chia-se', params: { bookId: book.id, layout, quote: quoteIndex } })}
          style={{ marginTop: spacing.xl }}
        />
        <Button title="Chia sẻ ngay" icon="share-social-outline" variant="outline" onPress={() => NativeShare.share({ message: shareText })} style={{ marginTop: spacing.md }} />
        <Pressable onPress={() => copyShareText(shareText)} style={styles.copyButton}>
          <Ionicons name="copy-outline" size={18} color={colors.primary} />
          <Text style={styles.copyText}>Sao chép nội dung giới thiệu</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  bookSummary: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  cover: { width: 72, height: 104, borderRadius: radius.md, backgroundColor: colors.surface3 },
  bookTitle: { ...typography.title, color: colors.text },
  author: { ...typography.body, color: colors.tertiary, marginTop: spacing.xs },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm },
  quote: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: spacing.sm },
  quoteActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.18)' },
  quoteText: { ...typography.body, color: colors.muted, flex: 1 },
  copyButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  copyText: { ...typography.body, color: colors.primary, fontWeight: '800' },
});
