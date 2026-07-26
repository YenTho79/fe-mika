import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen, Card } from '../components/UI';
import { books } from '../data/books';
import { colors, shadow } from '../constants/theme';

export default function SavedBooks() {
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState([]);

  // Load saved books
  const loadSavedBooks = async () => {
    try {
      const savedData = await AsyncStorage.getItem('mika_saved_books');
      if (savedData) {
        const savedIds = JSON.parse(savedData);
        // Filter books from books database that match the saved IDs
        const filteredBooks = books.filter(b => savedIds.includes(b.id));
        setSavedBooks(filteredBooks);
      } else {
        setSavedBooks([]);
      }
    } catch (error) {
      console.log('Error loading saved books', error);
    }
  };

  // Reload data every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedBooks();
    }, [])
  );

  // Remove book from saved list
  const removeBook = async (book) => {
    try {
      const savedData = await AsyncStorage.getItem('mika_saved_books');
      if (savedData) {
        let savedList = JSON.parse(savedData);
        savedList = savedList.filter(id => id !== book.id);
        await AsyncStorage.setItem('mika_saved_books', JSON.stringify(savedList));
        Alert.alert('Thành công', `Đã bỏ lưu truyện "${book.title}"`);
        loadSavedBooks(); // Refresh list
      }
    } catch (error) {
      console.log('Error removing book', error);
    }
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Truyện đã lưu" onBack={() => router.back()} />
      
      {savedBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="bookmark-outline" size={60} color={colors.outline} />
          </View>
          <Text style={styles.emptyText}>Danh sách truyện lưu trống</Text>
          <Text style={styles.emptySubtext}>Hãy khám phá những tác phẩm hấp dẫn và lưu lại tại đây nhé.</Text>
          <Pressable 
            style={styles.exploreBtn} 
            onPress={() => router.replace('/trang-chu')}
          >
            <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
            <Ionicons name="compass-outline" size={18} color="#ede0ff" />
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>Bạn đã lưu {savedBooks.length} cuốn truyện</Text>
          
          {savedBooks.map(book => (
            <Card key={book.id} style={styles.bookCard}>
              <Pressable 
                style={styles.bookPressArea}
                onPress={() => router.push({ pathname: '/chi-tiet', params: { id: book.id } })}
              >
                <Image source={{ uri: book.cover }} style={styles.bookCover} />
                
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author}</Text>
                  
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{book.category}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.metaText}>{book.status}</Text>
                  </View>
                  
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={colors.primary} />
                    <Text style={styles.ratingText}>{book.rating}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.viewsText}>{book.views} lượt đọc</Text>
                  </View>
                </View>
              </Pressable>

              <Pressable 
                style={styles.deleteButton} 
                onPress={() => removeBook(book)}
              >
                <Ionicons name="bookmark" size={24} color={colors.primary} />
              </Pressable>
            </Card>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  countText: {
    color: colors.outline,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 16,
    textTransform: 'uppercase'
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  bookPressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  bookCover: {
    width: 80,
    height: 112,
    borderRadius: 12,
    backgroundColor: colors.surface3
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  bookTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4
  },
  bookAuthor: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  metaText: {
    color: colors.outline,
    fontSize: 12,
    fontWeight: '700'
  },
  dot: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 12
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13
  },
  viewsText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600'
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -40
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  emptyText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8
  },
  emptySubtext: {
    color: colors.outline,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    ...shadow
  },
  exploreBtnText: {
    color: '#ede0ff',
    fontWeight: '800',
    fontSize: 15
  }
});
