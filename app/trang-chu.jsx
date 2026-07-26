import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { BottomNav, Button, Screen, SectionTitle } from '../components/UI';
import { books as localBooks } from '../data/books';
import { colors, shadow } from '../constants/theme';
import { fetchStories, getImageUrl } from '../constants/api';

const MIKA_LOGO_URL = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200&auto=format&fit=crop';

export default function Home() {
  const router = useRouter();
  const [allBooks, setAllBooks] = useState(localBooks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchStories();
        if (res.success && Array.isArray(res.results) && res.results.length > 0) {
          const mapped = res.results.map((s) => ({
            id: s.id,
            title: s.tieu_de,
            author: s.tac_gia,
            category: Array.isArray(s.the_loai) && s.the_loai.length > 0 ? s.the_loai[0] : 'Kỳ ảo',
            rating: s.diem_danh_gia || 4.8,
            chapters: s.so_chuong || 0,
            views: typeof s.luot_doc === 'number'
              ? (s.luot_doc >= 1000000 ? `${(s.luot_doc / 1000000).toFixed(1)}M` : s.luot_doc >= 1000 ? `${(s.luot_doc / 1000).toFixed(1)}K` : `${s.luot_doc}`)
              : (s.luot_doc || '0'),
            status: s.trang_thai || 'Đang ra',
            cover: getImageUrl(s.anh_bia_url),
            description: s.mo_ta || ''
          }));
          setAllBooks(mapped);
        }
      } catch (err) {
        console.log('Error fetching stories on home:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hero = allBooks[0] || localBooks[0];
  const readingBooks = allBooks.slice(1, 4).length > 0 ? allBooks.slice(1, 4) : localBooks.slice(1, 4);
  const featuredBooks = allBooks.slice(0, 4);
  const newBooks = allBooks.slice(0, 3);

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Thanh điều hướng trên */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image source={{ uri: MIKA_LOGO_URL }} style={styles.avatar} />
            <Text style={styles.brand}>Mika Books</Text>
          </View>

          <Pressable
            onPress={() => router.push('/noi-bat')}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={22} color={colors.primary} />
          </Pressable>
        </View>

        {/* Banner nổi bật */}
        <Pressable onPress={() => router.push({ pathname: '/chi-tiet', params: { id: hero.id } })}>
          <ImageBackground
            source={{ uri: hero.cover }}
            imageStyle={styles.heroImage}
            style={styles.hero}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.badge}>HOT NHẤT THÁNG</Text>

              <Text style={styles.heroTitle}>
                {hero.title}
              </Text>

              <Text style={styles.heroDesc} numberOfLines={2}>
                {hero.description || 'Khám phá vũ trụ rộng lớn cùng thợ săn tiền thưởng Kaelen.'}
              </Text>

              <View style={styles.heroActions}>
                <Button
                  title="Đọc ngay"
                  icon="book"
                  onPress={() => router.push({ pathname: '/chi-tiet', params: { id: hero.id } })}
                  style={styles.heroButton}
                />

                <Button
                  title="Chi tiết"
                  variant="outline"
                  onPress={() => router.push({ pathname: '/chi-tiet', params: { id: hero.id } })}
                  style={styles.heroButton}
                />
              </View>
            </View>
          </ImageBackground>
        </Pressable>

        {/* Truyện đang đọc */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Truyện đang đọc</Text>
            <Text style={styles.sectionSub}>Tiếp tục hành trình của bạn</Text>
          </View>

          <Pressable onPress={() => router.push('/tai-khoan')}>
            <Text style={styles.sectionAction}>Xem lịch sử</Text>
          </Pressable>
        </View>

        <View style={{ marginHorizontal: -20, marginBottom: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.readingList}
          >
            {readingBooks.map((book, index) => (
              <Pressable
                key={book.id}
                style={styles.readingCard}
                onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
              >
                <Image source={{ uri: book.cover }} style={styles.readingCover} />

                <View style={styles.readingInfo}>
                  <Text style={styles.readingTitle} numberOfLines={1}>
                    {book.title}
                  </Text>

                  <Text style={styles.readingChapter}>
                    Chương {index === 0 ? '124/500' : index === 1 ? '12/45' : '89/100'}
                  </Text>

                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: index === 0 ? '25%' : index === 1 ? '78%' : '89%' },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Truyện nổi bật và Sách mới */}
        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Truyện nổi bật</Text>

          <Pressable
            style={styles.seeAllRow}
            onPress={() => router.push('/noi-bat')}
          >
            <Text style={styles.sectionAction}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.bookGrid}>
          {featuredBooks.map((book, index) => (
            <Pressable
              key={book.id}
              style={styles.bookItem}
              onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
            >
              <View style={styles.bookCoverWrap}>
                <Image source={{ uri: book.cover }} style={styles.bookCover} />

                {index === 0 && (
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{book.rating || '9.8'}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>

              <Text style={styles.bookMeta} numberOfLines={1}>
                {book.category || 'Kỳ ảo'} • {book.views || '1.2M'} lượt đọc
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sách mới */}
        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Sách mới</Text>

          <Pressable onPress={() => router.push('/sach-moi')}>
            <Text style={styles.sectionAction}>Xem hết</Text>
          </Pressable>
        </View>

        <View style={styles.newBookList}>
          {newBooks.map((book, index) => (
            <Pressable
              key={book.id}
              style={styles.newBookItem}
              onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
            >
              <Image source={{ uri: book.cover }} style={styles.newBookCover} />

              <View style={styles.newBookText}>
                <Text style={styles.newBookTitle} numberOfLines={1}>
                  {book.title}
                </Text>

                <Text style={styles.newBookMeta}>
                  {book.category || 'Mới'} • Tác giả: {book.author}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>


        {/* Bài báo mới nhất */}
        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Bài báo mới nhất</Text>

          <Pressable onPress={() => router.push('/tin-tuc')}>
            <Text style={styles.sectionAction}>Khám phá blog</Text>
          </Pressable>
        </View>

        <View style={styles.articleList}>
          <Pressable onPress={() => router.push('/tin-tuc')} style={styles.articleCard}>
            <Image source={{ uri: hero.cover }} style={styles.articleImage} />

            <View style={styles.articleContent}>
              <View style={styles.articleTagRow}>
                <View style={styles.tagLine} />
                <Text style={styles.articleTag}>XU HƯỚNG</Text>
              </View>

              <Text style={styles.articleTitle} numberOfLines={2}>
                Văn hóa đọc trong kỷ nguyên AI: Những thay đổi đáng kinh ngạc
              </Text>

              <Text style={styles.articleDesc} numberOfLines={3}>
                Trí tuệ nhân tạo đang thay đổi cách chúng ta tiếp cận và tiêu
                thụ nội dung chữ viết như thế nào...
              </Text>

              <View style={styles.articleFooter}>
                <Text style={styles.articleMeta}>Admin • 15 phút đọc</Text>
                <MaterialIcons name="bookmark-border" size={18} color={colors.muted} />
              </View>
            </View>
          </Pressable>

          <Pressable onPress={() => router.push('/tin-tuc')} style={styles.articleCard}>
            <Image source={{ uri: allBooks[1]?.cover || hero.cover }} style={styles.articleImage} />

            <View style={styles.articleContent}>
              <View style={styles.articleTagRow}>
                <View style={[styles.tagLine, { backgroundColor: colors.primary }]} />
                <Text style={[styles.articleTag, { color: colors.primary }]}>TÁC GIẢ</Text>
              </View>

              <Text style={styles.articleTitle} numberOfLines={2}>
                Phỏng vấn độc quyền: Tương lai của dòng truyện Kỳ Ảo Việt
              </Text>

              <Text style={styles.articleDesc} numberOfLines={3}>
                Lắng nghe những chia sẻ từ các tác giả hàng đầu về thị trường
                truyện chữ đang bùng nổ...
              </Text>

              <View style={styles.articleFooter}>
                <Text style={styles.articleMeta}>Lucy Nguyen • 8 phút đọc</Text>
                <MaterialIcons name="bookmark" size={18} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav router={router} active="home" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },

  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },

  brand: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    height: 430,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 34,
    ...shadow,
  },

  heroImage: {
    borderRadius: 28,
  },

  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: 'rgba(11,19,38,0.45)',
  },

  badge: {
    alignSelf: 'flex-start',
    color: '#ede0ff',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  heroTitle: {
    color: colors.white,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 36,
  },

  heroDesc: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 20,
  },

  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },

  heroButton: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
  },

  sectionSub: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 13,
  },

  sectionAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  readingList: {
    gap: 14,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },

  readingCard: {
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,59,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  readingCover: {
    width: 78,
    height: 110,
    borderRadius: 12,
  },

  readingInfo: {
    flex: 1,
  },

  readingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },

  readingChapter: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },

  progressBg: {
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh || '#2d3449',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  featuredHeader: {
    marginTop: 28,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },

  bookItem: {
    width: '48%',
  },

  bookCoverWrap: {
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  bookCover: {
    width: '100%',
    height: '100%',
  },

  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  ratingText: {
    color: colors.tertiary || '#4edea3',
    fontSize: 11,
    fontWeight: '900',
  },

  bookTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 9,
  },

  bookMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },

  newBookList: {
    gap: 12,
  },

  newBookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  newBookCover: {
    width: 58,
    height: 82,
    borderRadius: 11,
  },

  newBookText: {
    flex: 1,
  },

  newBookTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },

  newBookMeta: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 12,
  },

  articleList: {
    gap: 18,
  },

  articleCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,41,59,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  articleImage: {
    width: '100%',
    height: 170,
  },

  articleContent: {
    padding: 18,
  },

  articleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  tagLine: {
    width: 4,
    height: 18,
    borderRadius: 99,
    backgroundColor: colors.tertiary || '#4edea3',
  },

  articleTag: {
    color: colors.tertiary || '#4edea3',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  articleTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '900',
  },

  articleDesc: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },

  articleFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  articleMeta: {
    color: colors.muted,
    fontSize: 12,
  },
});