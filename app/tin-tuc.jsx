import { ScrollView, Text, ImageBackground, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';

const articles = [
  { title: 'Tương lai của văn học số trong kỷ nguyên AI', time: '8 phút đọc' },
  { title: '10 tác phẩm khoa học viễn tưởng đáng đọc nhất', time: '5 phút đọc' },
  { title: 'Thói quen đọc sách trên thiết bị di động', time: '4 phút đọc' }
];

export default function News() {
  const router = useRouter();
  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header title="Bài báo & Tin tức" onBack={() => router.back()} rightIcon="search" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {['Tất cả','Công nghệ','Văn học','Xu hướng'].map((c,i) => <Chip key={c} label={c} active={i===0} />)}
        </ScrollView>
        {articles.map((item, index) => (
          <Pressable key={item.title} style={styles.card}>
            <ImageBackground source={{ uri: `https://images.unsplash.com/photo-${index === 0 ? '1507842217343-583bb7270b66' : index === 1 ? '1512820790803-83ca734da794' : '1495446815901-a7297e633e8d'}?q=80&w=900&auto=format&fit=crop` }} imageStyle={{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }} style={styles.image} />
            <Text style={styles.date}>12 Tháng 10, 2026 • {item.time}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>Bài viết demo phục vụ phần Frontend, giúp hiển thị giao diện tin tức trong app đọc sách online.</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  image: { height: 210 },
  date: { color: colors.muted, paddingHorizontal: 16, marginTop: 16 },
  title: { color: colors.primary, fontSize: 22, fontWeight: '900', paddingHorizontal: 16, marginTop: 8 },
  desc: { color: colors.muted, padding: 16, lineHeight: 22 }
});
