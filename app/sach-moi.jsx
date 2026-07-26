import { ScrollView, View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Screen } from '../components/UI';
import { books } from '../data/books';
import { colors, shadow } from '../constants/theme';

const categories = ['Tất cả', 'Tiểu thuyết', 'Kỹ năng', 'Kinh tế', 'Khoa học'];

const newBooks = [
  {
    title: 'Chân Trời Ánh Sáng',
    author: 'Alex Rivers',
    category: 'Viễn Tưởng',
    status: 'Đang ra',
    description:
      'Hành trình khám phá những vùng đất chưa từng có trong hệ mặt trời mới, nơi ánh sáng không bao giờ tắt...',
  },
  {
    title: 'Kỷ Nguyên Tĩnh Lặng',
    author: 'Minh Tuệ',
    category: 'Tâm Lý',
    status: 'Full',
    description:
      'Tìm kiếm sự bình yên trong thế giới công nghệ ồn ào và cách để tái kết nối với bản thân mình.',
  },
  {
    title: 'Mộng Ảo Neon',
    author: 'Trần Vũ',
    category: 'Trinh Thám',
    status: 'Đang ra',
    description:
      'Một vụ án mạng bí ẩn xảy ra tại trung tâm thành phố tương lai, nơi ranh giới giữa người và máy bị xóa nhòa.',
  },
  {
    title: 'Tư Duy Tài Chính Mới',
    author: 'Dr. Elena Smith',
    category: 'Kinh Tế',
    status: 'Full',
    description:
      'Phân tích những biến động kinh tế toàn cầu và các chiến lược đầu tư thông minh trong kỷ nguyên số.',
  },
  {
    title: 'Kẻ Dệt Bóng Đêm',
    author: 'Hoàng Lâm',
    category: 'Fantasy',
    status: 'Đang ra',
    description:
      'Trong một thế giới bị bóng tối bao phủ, một cậu bé có khả năng điều khiển bóng đen phải đứng lên cứu lấy bộ tộc.',
  },
];

export default function NewBooks() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const list = newBooks.map((item, index) => ({
    ...item,
    id: index + 1,
    cover: books[index % books.length]?.cover,
  }));

  return (
    <Screen padded={false} safeAreaTop={false}>
      {/* Thanh điều hướng trên */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={23} color={colors.primary} />
          </Pressable>

          <Text style={styles.headerTitle}>Sách mới</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="search" size={22} color={colors.primary} />
          </Pressable>

          <Image source={{ uri: books[0]?.cover }} style={styles.avatar} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Bộ lọc thể loại */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        >
          {categories.map((item, index) => {
            const active = index === 0;

            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Danh sách sách */}
        <View style={styles.list}>
          {list.map((book, index) => (
            <Pressable
              key={book.id}
              onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
              style={styles.item}
            >
              <View style={styles.coverWrap}>
                <Image source={{ uri: book.cover }} style={styles.cover} />

                {index === 0 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>MỚI</Text>
                  </View>
                )}
              </View>

              <View style={styles.content}>
                <View>
                  <Text numberOfLines={1} style={styles.title}>
                    {book.title}
                  </Text>

                  <Text numberOfLines={1} style={styles.author}>
                    {book.author}
                  </Text>

                  <View style={styles.tagRow}>
                    <Text style={styles.tag}>{book.category}</Text>

                    <Text
                      style={[
                        styles.status,
                        book.status === 'Full' && styles.statusFull,
                      ]}
                    >
                      {book.status}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={2} style={styles.desc}>
                  {book.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomNav router={router} active="new" />
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
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  chipList: {
    gap: 10,
    paddingBottom: 22,
  },

  chip: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(30,41,59,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  chipActive: {
    backgroundColor: colors.primaryContainer || '#7c3aed',
    borderColor: colors.primaryContainer || '#7c3aed',
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

  list: {
    gap: 16,
  },

  item: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,59,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadow,
  },

  coverWrap: {
    width: 96,
    height: 144,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  cover: {
    width: '100%',
    height: '100%',
  },

  newBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(0,118,80,0.85)',
  },

  newBadgeText: {
    color: '#76ffc2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },

  author: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
  },

  tag: {
    color: colors.primary,
    backgroundColor: 'rgba(124,58,237,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  status: {
    color: colors.muted,
    backgroundColor: '#2d3449',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '900',
  },

  statusFull: {
    color: colors.tertiary || '#4edea3',
    backgroundColor: 'rgba(78,222,163,0.16)',
  },

  desc: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
});