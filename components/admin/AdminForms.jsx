import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminFormSection, AdminHeader, FALLBACK_COVER } from '../AdminUI';
import { FilterChip, ImagePickerPlaceholder, PrimaryButton, Screen, SecondaryButton, TextField, Toast } from '../UI';
import { colors, radius, spacing, typography } from '../../constants/theme';
import {
  getAdminBooks,
  getAdminChapters,
  getArticleById,
  getBookById,
  getCategories,
  getChapterById,
  saveArticle,
  saveBook,
  saveChapter,
} from '../../services/localDataService';

const today = () => new Date().toISOString().slice(0, 10);
const isWebUrl = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim());

function ToggleRow({ label, description, value, onChange }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDescription}>{description}</Text> : null}
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.knob, value && styles.knobActive]} />
      </View>
    </Pressable>
  );
}

export function BookForm({ mode = 'create' }) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', author: '', description: '', cover: '', categories: [], status: 'Đang ra',
    rating: '5', featured: false, publishedAt: today(),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), mode === 'edit' && id ? getBookById(id) : null]).then(([items, book]) => {
      setCategories(items);
      if (book) setForm({ ...book, status: book.status === 'Full' ? 'Hoàn thành' : book.status, rating: String(book.rating ?? 5), categories: book.categories || [book.category].filter(Boolean) });
    });
  }, [id, mode]);

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleCategory = (category) => patch(
    'categories',
    form.categories.includes(category) ? form.categories.filter((item) => item !== category) : [...form.categories, category]
  );

  const submit = async () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Tên truyện là bắt buộc.';
    if (!form.author.trim()) nextErrors.author = 'Tác giả là bắt buộc.';
    if (!form.categories.length) nextErrors.categories = 'Chọn ít nhất một thể loại.';
    const rating = Number(form.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) nextErrors.rating = 'Điểm phải từ 0 đến 5.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const cover = form.cover.trim() && isWebUrl(form.cover) ? form.cover.trim() : FALLBACK_COVER;
    await saveBook({
      ...form, id: mode === 'edit' ? id : undefined, title: form.title.trim(), author: form.author.trim(),
      description: form.description.trim(), cover, rating, category: form.categories[0],
    });
    setSaving(false);
    router.replace('/admin/truyen');
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title={mode === 'edit' ? 'Chỉnh sửa truyện' : 'Thêm truyện'} back />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminFormSection title="Thông tin chính" description="Tên và tác giả sẽ hiển thị ở mọi khu vực người dùng.">
          <TextField label="Tên truyện" value={form.title} onChangeText={(value) => patch('title', value)} error={errors.title} placeholder="Nhập tên truyện" />
          <TextField label="Tác giả" value={form.author} onChangeText={(value) => patch('author', value)} error={errors.author} placeholder="Tên tác giả" />
          <TextField label="Mô tả" value={form.description} onChangeText={(value) => patch('description', value)} placeholder="Giới thiệu nội dung" multiline numberOfLines={5} />
        </AdminFormSection>

        <AdminFormSection title="Ảnh bìa" description="URL không hợp lệ sẽ tự dùng ảnh bìa dự phòng.">
          <ImagePickerPlaceholder uri={isWebUrl(form.cover) ? form.cover : FALLBACK_COVER} onPress={() => setToast('Dán URL ảnh vào ô bên dưới hoặc dùng ảnh mặc định.')} />
          <TextField label="URL ảnh" value={form.cover} onChangeText={(value) => patch('cover', value)} placeholder="https://..." autoCapitalize="none" style={{ marginTop: spacing.md }} />
        </AdminFormSection>

        <AdminFormSection title="Phân loại và xuất bản">
          <Text style={styles.fieldLabel}>Thể loại</Text>
          <View style={styles.wrap}>{categories.map((item) => <FilterChip key={item} label={item} active={form.categories.includes(item)} onPress={() => toggleCategory(item)} />)}</View>
          {errors.categories ? <Text style={styles.error}>{errors.categories}</Text> : null}
          <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Trạng thái</Text>
          <View style={styles.wrap}>{['Bản nháp', 'Đang ra', 'Hoàn thành', 'Tạm dừng'].map((item) => <FilterChip key={item} label={item} active={form.status === item} onPress={() => patch('status', item)} />)}</View>
          <TextField label="Điểm đánh giá ban đầu" value={form.rating} onChangeText={(value) => patch('rating', value)} keyboardType="decimal-pad" error={errors.rating} style={{ marginTop: spacing.lg }} />
          <TextField label="Ngày phát hành" value={form.publishedAt} onChangeText={(value) => patch('publishedAt', value)} placeholder="YYYY-MM-DD" />
          <ToggleRow label="Truyện nổi bật" description="Ưu tiên xuất hiện trong khu vực khám phá." value={form.featured} onChange={(value) => patch('featured', value)} />
        </AdminFormSection>
        <PrimaryButton title={mode === 'edit' ? 'Lưu thay đổi' : 'Tạo truyện'} icon="save-outline" loading={saving} onPress={submit} />
        <SecondaryButton title="Hủy" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </ScrollView>
      <Toast visible={Boolean(toast)} message={toast} onDismiss={() => setToast('')} />
    </Screen>
  );
}

export function ChapterForm({ mode = 'create' }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id;
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    bookId: params.bookId || '', number: '1', title: '', content: '', status: 'published',
    locked: false, coinPrice: '0', publishedAt: today(),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminBooks(), mode === 'edit' && id ? getChapterById(id) : null]).then(([items, chapter]) => {
      setBooks(items);
      if (chapter) setForm({ ...chapter, number: String(chapter.number), coinPrice: String(chapter.coinPrice || 0), status: chapter.status || 'published' });
      else if (!params.bookId && items[0]) setForm((current) => ({ ...current, bookId: items[0].id }));
    });
  }, [id, mode, params.bookId]);

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    const nextErrors = {};
    const number = Number(form.number);
    const price = Number(form.coinPrice);
    if (!form.bookId) nextErrors.bookId = 'Vui lòng chọn truyện.';
    if (!Number.isInteger(number) || number <= 0) nextErrors.number = 'Số chương phải là số nguyên dương.';
    if (!form.title.trim()) nextErrors.title = 'Tiêu đề là bắt buộc.';
    if (!form.content.trim()) nextErrors.content = 'Nội dung là bắt buộc.';
    if (form.locked && (!Number.isFinite(price) || price <= 0)) nextErrors.coinPrice = 'Chương khóa phải có giá xu lớn hơn 0.';
    const siblings = form.bookId ? await getAdminChapters(form.bookId) : [];
    if (siblings.some((item) => Number(item.number) === number && String(item.id) !== String(id || ''))) nextErrors.number = 'Số chương đã tồn tại trong truyện này.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const saved = await saveChapter({
      ...form, id: mode === 'edit' ? id : undefined, number, coinPrice: form.locked ? price : 0,
      title: form.title.trim(), content: form.content.trim(),
    });
    setSaving(false);
    router.replace({ pathname: '/admin/chuong', params: { bookId: saved.bookId } });
  };

  const selectedBook = books.find((item) => String(item.id) === String(form.bookId));
  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title={mode === 'edit' ? 'Chỉnh sửa chương' : 'Thêm chương'} subtitle={selectedBook?.title} back />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminFormSection title="Truyện và thứ tự">
          <Text style={styles.fieldLabel}>Thuộc truyện</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}>
            {books.map((book) => <FilterChip key={book.id} label={book.title} active={String(form.bookId) === String(book.id)} onPress={() => patch('bookId', book.id)} />)}
          </ScrollView>
          {errors.bookId ? <Text style={styles.error}>{errors.bookId}</Text> : null}
          <TextField label="Số chương" value={form.number} onChangeText={(value) => patch('number', value)} keyboardType="number-pad" error={errors.number} />
          <TextField label="Tiêu đề" value={form.title} onChangeText={(value) => patch('title', value)} error={errors.title} placeholder="Tên chương" />
        </AdminFormSection>
        <AdminFormSection title="Nội dung">
          <TextField value={form.content} onChangeText={(value) => patch('content', value)} error={errors.content} placeholder="Nhập nội dung chương..." multiline numberOfLines={14} inputStyle={{ minHeight: 230 }} />
        </AdminFormSection>
        <AdminFormSection title="Xuất bản và giá">
          <View style={styles.wrap}>{[['published', 'Đã đăng'], ['draft', 'Bản nháp']].map(([value, label]) => <FilterChip key={value} label={label} active={form.status === value} onPress={() => patch('status', value)} />)}</View>
          <ToggleRow label="Khóa chương" description="Người đọc cần dùng xu để mở khóa." value={form.locked} onChange={(value) => patch('locked', value)} />
          {form.locked ? <TextField label="Giá xu" value={form.coinPrice} onChangeText={(value) => patch('coinPrice', value)} keyboardType="number-pad" error={errors.coinPrice} /> : null}
          <TextField label="Ngày đăng" value={form.publishedAt} onChangeText={(value) => patch('publishedAt', value)} placeholder="YYYY-MM-DD" />
        </AdminFormSection>
        {mode === 'edit' ? <SecondaryButton title="Xem trước trong trình đọc" icon="eye-outline" onPress={() => router.push({ pathname: '/doc-sach', params: { bookId: form.bookId, chapter: id } })} style={{ marginBottom: spacing.md }} /> : null}
        <PrimaryButton title="Lưu chương" icon="save-outline" loading={saving} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

export function ArticleForm({ mode = 'create' }) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [form, setForm] = useState({ title: '', summary: '', content: '', image: '', category: 'Thông báo', status: 'published', featured: false, publishedAt: today() });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const articleCategories = useMemo(() => ['Thông báo', 'Sự kiện', 'Khuyến mãi', 'Phỏng vấn', 'Mẹo đọc'], []);

  useEffect(() => {
    if (mode === 'edit' && id) getArticleById(id).then((article) => article && setForm(article));
  }, [id, mode]);
  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Tiêu đề là bắt buộc.';
    if (!form.summary.trim()) nextErrors.summary = 'Tóm tắt là bắt buộc.';
    if (!form.content.trim()) nextErrors.content = 'Nội dung là bắt buộc.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    await saveArticle({ ...form, id: mode === 'edit' ? id : undefined, image: isWebUrl(form.image) ? form.image.trim() : FALLBACK_COVER });
    setSaving(false);
    router.replace('/admin/tin-tuc');
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title={mode === 'edit' ? 'Chỉnh sửa bài viết' : 'Viết bài mới'} back />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminFormSection title="Nội dung bài viết">
          <TextField label="Tiêu đề" value={form.title} onChangeText={(value) => patch('title', value)} error={errors.title} />
          <TextField label="Tóm tắt" value={form.summary} onChangeText={(value) => patch('summary', value)} error={errors.summary} multiline numberOfLines={3} />
          <TextField label="Nội dung" value={form.content} onChangeText={(value) => patch('content', value)} error={errors.content} multiline numberOfLines={12} inputStyle={{ minHeight: 200 }} />
          <TextField label="URL ảnh" value={form.image} onChangeText={(value) => patch('image', value)} placeholder="https://..." autoCapitalize="none" />
        </AdminFormSection>
        <AdminFormSection title="Phân loại và xuất bản">
          <Text style={styles.fieldLabel}>Thể loại</Text>
          <View style={styles.wrap}>{articleCategories.map((item) => <FilterChip key={item} label={item} active={form.category === item} onPress={() => patch('category', item)} />)}</View>
          <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Trạng thái</Text>
          <View style={styles.wrap}>{[['published', 'Đã đăng'], ['draft', 'Bản nháp']].map(([value, label]) => <FilterChip key={value} label={label} active={form.status === value} onPress={() => patch('status', value)} />)}</View>
          <TextField label="Ngày đăng" value={form.publishedAt} onChangeText={(value) => patch('publishedAt', value)} style={{ marginTop: spacing.md }} />
          <ToggleRow label="Bài viết nổi bật" value={form.featured} onChange={(value) => patch('featured', value)} />
        </AdminFormSection>
        {mode === 'edit' && form.status === 'published' ? <SecondaryButton title="Xem trước giao diện User" icon="eye-outline" onPress={() => router.push({ pathname: '/chi-tiet-tin-tuc', params: { id } })} style={{ marginBottom: spacing.md }} /> : null}
        <PrimaryButton title="Lưu bài viết" icon="save-outline" loading={saving} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fieldLabel: { ...typography.caption, color: colors.muted, fontWeight: '700', marginBottom: spacing.sm },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  toggleLabel: { ...typography.body, color: colors.text, fontWeight: '700' },
  toggleDescription: { ...typography.caption, color: colors.muted, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: radius.round, padding: 3, backgroundColor: colors.surface3 },
  toggleActive: { backgroundColor: colors.primaryContainer },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.outline },
  knobActive: { backgroundColor: colors.white, alignSelf: 'flex-end' },
});
