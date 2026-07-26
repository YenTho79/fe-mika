import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Screen } from '../components/UI';
import { books } from '../data/books';
import { colors, shadow } from '../constants/theme';

const categories = [
  'Tất cả',
  'Tiên hiệp',
  'Kiếm hiệp',
  'Ngôn tình',
  'Huyền huyễn',
  'Đô thị',
];

const demoBooks = [
  {
    id: 1,
    title: 'Vạn Cổ Tối Cường',
    author: 'Thanh Phong',
    category: 'Tiên hiệp',
    rating: '4.9',
    views: '1.2M',
  },
  {
    id: 2,
    title: 'Kiếm Đạo Độc Tôn',
    author: 'Kiếm Du Thái Hư',
    category: 'Kiếm hiệp',
    rating: '4.8',
    views: '850K',
  },
  {
    id: 3,
    title: 'Gió Thổi Mùa Hạ',
    author: 'Diệp Lạc',
    category: 'Ngôn tình',
    rating: '4.7',
    views: '2.4M',
  },
  {
    id: 4,
    title: 'Ma Đạo Tổ Sư',
    author: 'Mặc Hương',
    category: 'Huyền huyễn',
    rating: '5.0',
    views: '5.1M',
  },
  {
    id: 5,
    title: 'Tinh Thần Biến',
    author: 'Ngã Ăn Tây Hồng Thị',
    category: 'Viễn tưởng',
    rating: '4.6',
    views: '1.8M',
  },
  {
    id: 6,
    title: 'Phàm Nhân Tu Tiên',
    author: 'Vong Ngữ',
    category: 'Tiên hiệp',
    rating: '4.9',
    views: '9.2M',
  },
];

export default function Featured() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');

  const list = demoBooks.map((item, index) => ({
    ...item,
    cover: books[index % books.length]?.cover,
  }));

  const filtered = list.filter((book) => {
    const matchCategory = category === 'Tất cả' || book.category === category;
    const matchSearch =
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <Screen padded={false} safeAreaTop={false}>
      {/* Thanh điều hướng trên */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={23} color={colors.primary} />
          </Pressable>

          <Text style={styles.headerTitle}>Truyện nổi bật</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="search" size={22} color={colors.primary} />
          </Pressable>

          <Image
            source={{ uri: books[0]?.cover }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Tìm kiếm */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.outline || '#958da1'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm truyện hoặc tác giả..."
            placeholderTextColor={colors.outline || '#958da1'}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.outline || '#958da1'} />
            </Pressable>
          )}
        </View>

        {/* Lọc thể loại */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>THỂ LOẠI</Text>
          <Ionicons name="options" size={22} color={colors.primary} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        >
          {categories.map((item) => {
            const active = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lưới truyện */}
        <View style={styles.grid}>
          {filtered.map((book, index) => (
            <Pressable
              key={`${book.id}-${index}`}
              style={styles.card}
              onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
            >
              <View style={styles.coverWrap}>
                <Image source={{ uri: book.cover }} style={styles.cover} />

                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={14} color={colors.tertiary || '#4edea3'} />
                  <Text style={styles.ratingText}>{book.rating}</Text>
                </View>

                {index === 0 && (
                  <View style={styles.readOverlay}>
                    <Text style={styles.readNow}>Đọc ngay</Text>
                  </View>
                )}
              </View>

              <Text style={styles.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>

              <Text style={styles.author} numberOfLines={1}>
                {book.author}
              </Text>

              <View style={styles.viewRow}>
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color={colors.outline || '#958da1'}
                />
                <Text style={styles.views}>{book.views}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={42} color={colors.outline || '#958da1'} />
            <Text style={styles.empty}>Không tìm thấy truyện phù hợp.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav router={router} active="featured" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    backgroundColor: 'rgba(11,19,38,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '900',
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(210,187,255,0.45)',
  },

  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh || '#222a3d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 22,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  categoryTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  chipList: {
    gap: 12,
    paddingBottom: 22,
  },

  chip: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface || '#171f33',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  chipActive: {
    backgroundColor: colors.primaryContainer || '#7c3aed',
    borderColor: colors.primary,
    shadowColor: colors.primaryContainer || '#7c3aed',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },

  chipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },

  chipTextActive: {
    color: '#ede0ff',
    fontWeight: '900',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 22,
  },

  card: {
    width: '47.8%',
  },

  coverWrap: {
    aspectRatio: 2 / 3,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadow,
  },

  cover: {
    width: '100%',
    height: '100%',
  },

  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(11,19,38,0.72)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  readOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  readNow: {
    color: colors.onPrimary || '#3f008e',
    fontSize: 13,
    fontWeight: '900',
  },

  bookTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },

  author: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },

  views: {
    color: colors.outline || '#958da1',
    fontSize: 12,
  },

  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },

  empty: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 15,
  },
});