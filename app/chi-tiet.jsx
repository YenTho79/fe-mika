import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, ImageBackground, Pressable, Alert, StyleSheet, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Header, Screen, Chip } from '../components/UI';
import { books, chapters } from '../data/books';
import { colors, shadow } from '../constants/theme';
import { fetchStoryDetail, getImageUrl } from '../constants/api';

export default function Detail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Dynamic book loading
  const bookId = id ? parseInt(id, 10) : 1;
  const [apiBook, setApiBook] = useState(null);
  const [chapterList, setChapterList] = useState(chapters);
  
  const book = apiBook || (books.find(b => b.id === bookId) || books[0]);

  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('Tổng quan');
  
  // Dynamic favorites counter
  const baseFavorites = book.id === 1 ? 85000 : book.id === 2 ? 62000 : book.id === 3 ? 12000 : 9500;
  const [favoritesCount, setFavoritesCount] = useState(baseFavorites);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('4.8');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Fetch story detail from API
  useEffect(() => {
    async function loadStoryDetail() {
      try {
        const res = await fetchStoryDetail(bookId);
        if (res.success && res.story) {
          const s = res.story;
          const fetchedBook = {
            id: s.id,
            title: s.tieu_de,
            author: s.tac_gia,
            category: Array.isArray(s.the_loai) && s.the_loai.length > 0 ? s.the_loai[0] : 'Kỳ ảo',
            categories: Array.isArray(s.the_loai) && s.the_loai.length > 0 ? s.the_loai : ['Kỳ ảo', 'Hành động'],
            rating: s.diem_danh_gia || 4.8,
            chapters: s.so_chuong || (Array.isArray(s.chuongs) ? s.chuongs.length : 0),
            views: typeof s.luot_doc === 'number'
              ? (s.luot_doc >= 1000000 ? `${(s.luot_doc / 1000000).toFixed(1)}M` : s.luot_doc >= 1000 ? `${(s.luot_doc / 1000).toFixed(1)}K` : `${s.luot_doc}`)
              : (s.luot_doc || '0'),
            status: s.trang_thai || 'Đang ra',
            cover: getImageUrl(s.anh_bia_url),
            description: s.mo_ta || ''
          };
          setApiBook(fetchedBook);

          if (Array.isArray(s.chuongs) && s.chuongs.length > 0) {
            const mappedChs = s.chuongs.map(c => ({
              id: c.so_thu_tu_chuong || c.id,
              title: c.tieu_de || `Chương ${c.so_thu_tu_chuong || c.id}`,
              state: c.co_khoa ? 'Trả phí' : 'Miễn phí',
              locked: c.co_khoa
            }));
            setChapterList(mappedChs);
          }
        }
      } catch (error) {
        console.log('Error fetching story detail:', error);
      }
    }
    loadStoryDetail();
  }, [bookId]);

  // Formatter for counts (e.g. 85.1k)
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  // Load Saved (Favorite) status
  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedData = await AsyncStorage.getItem('mika_saved_books');
        if (savedData) {
          const savedList = JSON.parse(savedData);
          const isSaved = savedList.includes(book.id);
          setSaved(isSaved);
          setFavoritesCount(isSaved ? baseFavorites + 1 : baseFavorites);
        } else {
          setSaved(false);
          setFavoritesCount(baseFavorites);
        }
      } catch (error) {
        console.log('Error loading saved state', error);
      }
    }
    loadSavedState();
  }, [book.id]);


  // Load reviews from AsyncStorage
  useEffect(() => {
    async function loadReviews() {
      try {
        const reviewsKey = `mika_reviews_${book.id}`;
        const storedReviews = await AsyncStorage.getItem(reviewsKey);
        
        let initialReviews = [];
        if (storedReviews) {
          initialReviews = JSON.parse(storedReviews);
        } else {
          // Pre-populate mock reviews
          if (book.id === 1) {
            initialReviews = [
              { id: '1', name: 'Hoàng Long', rating: 5, content: 'Truyện hay quá, cốt truyện lôi cuốn, thế giới viễn tưởng xây dựng rất chi tiết và hoành tráng!', date: '18/07/2026' },
              { id: '2', name: 'Thanh Trúc', rating: 5, content: 'Đọc một lèo hết chương mới nhất luôn. Kaelen ngầu đét, mong tác giả ra chương mới nhanh nhanh.', date: '15/07/2026' },
              { id: '3', name: 'Quốc Bảo', rating: 4, content: 'Dịch mượt, nội dung cuốn hút. Có điều ra hơi chậm nha admin ơi.', date: '10/07/2026' }
            ];
          } else if (book.id === 2) {
            initialReviews = [
              { id: '1', name: 'Thanh Phong Tử', rating: 5, content: 'Cốt truyện kiếm hiệp cổ điển cực hay. Tác phong viết rất vững tay.', date: '17/07/2026' },
              { id: '2', name: 'Mộc Lan', rating: 4, content: 'Tính cách nhân vật chính kiên cường, hành động dứt khoát. Rất thích!', date: '13/07/2026' }
            ];
          } else {
            initialReviews = [
              { id: '1', name: 'Minh Quân', rating: 5, content: 'Truyện siêu hay, đề cử mọi người nên đọc thử nhé!', date: '16/07/2026' },
              { id: '2', name: 'Hương Giang', rating: 4, content: 'Cốt truyện ổn, nhân vật có chiều sâu.', date: '14/07/2026' }
            ];
          }
          await AsyncStorage.setItem(reviewsKey, JSON.stringify(initialReviews));
        }
        setReviews(initialReviews);
        
        if (initialReviews.length > 0) {
          const totalRating = initialReviews.reduce((sum, r) => sum + r.rating, 0);
          const avg = totalRating / initialReviews.length;
          setAverageRating(avg.toFixed(1));
        } else {
          setAverageRating('0.0');
        }
      } catch (error) {
        console.log('Error loading reviews', error);
      }
    }
    loadReviews();
  }, [book.id]);

  // Toggle favorite (save)
  async function toggleSave() {
    try {
      const savedData = await AsyncStorage.getItem('mika_saved_books');
      let savedList = savedData ? JSON.parse(savedData) : [];
      
      if (saved) {
        savedList = savedList.filter(id => id !== book.id);
        setSaved(false);
        setFavoritesCount(baseFavorites);
        Alert.alert('Thành công', `Đã bỏ lưu truyện "${book.title}"`);
      } else {
        savedList.push(book.id);
        setSaved(true);
        setFavoritesCount(baseFavorites + 1);
        Alert.alert('Thành công', `Đã lưu truyện "${book.title}" vào danh sách yêu thích`);
      }
      await AsyncStorage.setItem('mika_saved_books', JSON.stringify(savedList));
    } catch (error) {
      console.log('Error toggling save book', error);
      Alert.alert('Lỗi', 'Không thể thực hiện tác vụ này lúc này.');
    }
  }

  // Submit a new review
  async function submitReview() {
    if (!newComment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá.');
      return;
    }
    
    try {
      const userData = await AsyncStorage.getItem('mika_user');
      let userName = 'Người dùng Mika';
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.name) userName = parsed.name;
      }
      
      const newReview = {
        id: Date.now().toString(),
        name: userName,
        rating: newRating,
        content: newComment.trim(),
        date: new Date().toLocaleDateString('vi-VN')
      };
      
      const updatedReviews = [newReview, ...reviews];
      const reviewsKey = `mika_reviews_${book.id}`;
      await AsyncStorage.setItem(reviewsKey, JSON.stringify(updatedReviews));
      
      setReviews(updatedReviews);
      
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalRating / updatedReviews.length;
      setAverageRating(avg.toFixed(1));
      
      setNewRating(5);
      setNewComment('');
      setShowRatingModal(false);
      Alert.alert('Thành công', 'Cảm ơn bạn đã gửi đánh giá cho bộ truyện!');
    } catch (error) {
      console.log('Error submitting review', error);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá.');
    }
  }

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Chi tiết truyện" onBack={() => router.back()} rightIcon="share-social" onRight={() => router.push('/chia-se')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION WITH SHARP PORTRAIT COVER */}
        <View style={styles.heroSection}>
          <ImageBackground 
            source={{ uri: book.cover }} 
            style={styles.heroBg} 
            imageStyle={{ opacity: 0.18 }}
          >
            <View style={styles.heroOverlay}>
              {/* Portrait Cover Card */}
              <View style={styles.coverCardWrap}>
                <Image source={{ uri: book.cover }} style={styles.coverCard} resizeMode="cover" />
              </View>

              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" color={colors.tertiary} size={15} />
                <Text style={styles.ratingBadgeText}>{averageRating} ({reviews.length} đánh giá)</Text>
              </View>

              {/* Title & Author */}
              <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.author}>Tác giả: {book.author}</Text>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button title="Đọc ngay" icon="book" onPress={() => router.push('/doc-sach')} style={{ flex: 1 }} />
                <Button title={saved ? 'Đã lưu' : 'Lưu'} variant="outline" icon={saved ? 'bookmark' : 'bookmark-outline'} onPress={toggleSave} style={{ flex: 1 }} />
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.mainContent}>
          {/* Stats Card */}
          <Card style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{book.chapters}</Text>
              <Text style={styles.statText}>Chương</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{book.views}</Text>
              <Text style={styles.statText}>Lượt đọc</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{formatCount(favoritesCount)}</Text>
              <Text style={styles.statText}>Yêu thích</Text>
            </View>
          </Card>

          {/* Navigation Tabs */}
          <View style={styles.tabsRow}>
            {['Tổng quan', 'Chương truyện'].map(t => (
              <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </View>

          {tab === 'Tổng quan' ? (
            <View>
              <Text style={styles.sectionTitle}>Nội dung</Text>
              <Text style={styles.desc}>{book.description}</Text>
              <Text style={styles.sectionTitle}>Thể loại</Text>
              <View style={styles.categoryChips}>
                {[book.category, 'Hành động', 'Phiêu lưu'].map(c => (
                  <Chip key={c} label={c} active />
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <Card style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bigRating}>{averageRating} <Text style={{ fontSize: 16, color: colors.outline }}>/ 5</Text></Text>
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Ionicons 
                          key={star} 
                          name={star <= Math.round(parseFloat(averageRating)) ? 'star' : 'star-outline'} 
                          color={colors.primary} 
                          size={16} 
                        />
                      ))}
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{reviews.length} lượt đánh giá thực tế</Text>
                  </View>
                  <Button 
                    title="Viết đánh giá" 
                    variant="outline" 
                    icon="create-outline" 
                    onPress={() => setShowRatingModal(true)} 
                    style={styles.writeReviewBtn}
                  />
                </View>
                
                {reviews.length === 0 ? (
                  <Text style={styles.emptyReview}>
                    Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                  </Text>
                ) : (
                  reviews.map(item => (
                    <View key={item.id} style={styles.reviewItem}>
                      <View style={styles.reviewUserRow}>
                        <View style={styles.userAvatarRow}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
                          </View>
                          <Text style={styles.userName}>{item.name}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Ionicons 
                              key={star} 
                              name={star <= item.rating ? 'star' : 'star-outline'} 
                              color={colors.primary} 
                              size={13} 
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewBody}>{item.content}</Text>
                      <Text style={styles.reviewDate}>{item.date}</Text>
                    </View>
                  ))
                )}
              </Card>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Danh sách chương</Text>
              {chapterList.map(ch => (
                <Pressable 
                  key={ch.id} 
                  onPress={() => ch.locked ? router.push('/nap-xu') : router.push({ pathname: '/doc-sach', params: { chapter: ch.id, bookId: book.id } })} 
                  style={styles.chapter}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.chapterNo}>Chương {ch.id}</Text>
                    <Text style={styles.chapterTitle}>{ch.title}</Text>
                    <Text style={styles.chapterState}>{ch.state}</Text>
                  </View>
                  <Ionicons name={ch.locked ? 'lock-closed' : 'chevron-forward'} color={colors.primary} size={22} />
                </Pressable>
              ))}
              <Button title="Nạp xu để mở khóa chương" icon="wallet" onPress={() => router.push('/nap-xu')} style={{ marginTop: 16 }} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Viết Đánh Giá */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Viết Đánh Giá</Text>
            <Text style={styles.modalSub}>{book.title}</Text>
            
            {/* Chọn số sao */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Pressable key={star} onPress={() => setNewRating(star)} style={{ padding: 6 }}>
                  <Ionicons 
                    name={star <= newRating ? 'star' : 'star-outline'} 
                    color={colors.primary} 
                    size={36} 
                  />
                </Pressable>
              ))}
            </View>
            
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
              {newRating === 5 ? 'Cực kỳ thích' : newRating === 4 ? 'Rất tốt' : newRating === 3 ? 'Bình thường' : newRating === 2 ? 'Tạm được' : 'Rất tệ'}
            </Text>
            
            {/* Ô nhập nội dung */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nghĩ của bạn về cuốn truyện này..."
              placeholderTextColor={colors.outline}
              multiline
              numberOfLines={4}
              value={newComment}
              onChangeText={setNewComment}
            />
            
            {/* Hàng nút bấm */}
            <View style={styles.modalButtons}>
              <Button 
                title="Hủy" 
                variant="outline" 
                onPress={() => {
                  setShowRatingModal(false);
                  setNewRating(5);
                  setNewComment('');
                }} 
                style={{ flex: 1 }} 
              />
              <Button 
                title="Gửi" 
                onPress={submitReview} 
                style={{ flex: 1 }} 
              />
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: 'rgba(11,19,38,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  heroBg: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroOverlay: {
    alignItems: 'center',
    width: '100%',
  },
  coverCardWrap: {
    width: 140,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 16,
    ...shadow,
  },
  coverCard: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(78,222,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(78,222,163,0.3)',
    marginBottom: 12,
  },
  ratingBadgeText: {
    color: colors.tertiary,
    fontWeight: '800',
    fontSize: 13,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 32,
  },
  author: {
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  mainContent: {
    padding: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  statText: {
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  line: {
    height: 32,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    marginBottom: 6,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 12,
  },
  desc: {
    color: colors.muted,
    lineHeight: 24,
    fontSize: 14,
  },
  reviewCard: {
    padding: 18,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  bigRating: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  writeReviewBtn: {
    minHeight: 40,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  emptyReview: {
    color: colors.outline,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
    marginTop: 12,
  },
  reviewUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  userName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  reviewBody: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  reviewDate: {
    color: colors.outline,
    fontSize: 10,
    marginTop: 4,
  },
  chapter: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...shadow,
  },
  chapterNo: {
    color: colors.outline,
    fontWeight: '800',
    fontSize: 12,
  },
  chapterTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  chapterState: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,11,21,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.surface,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSub: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
