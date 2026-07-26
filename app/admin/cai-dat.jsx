import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminFormSection, AdminHeader, AdminPageTitle } from '../../components/AdminUI';
import { BottomSheet, ConfirmDialog, DangerButton, PrimaryButton, Screen, SecondaryButton, TextField, Toast } from '../../components/UI';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { exportLocalData, getAdminSettings, getCategories, getCurrentUser, logout, restoreDemoData, saveAdminSettings, saveCategories } from '../../services/localDataService';

export default function AdminSettings() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [settings, setSettings] = useState({ appName: '', bannerTitle: '', bannerSubtitle: '' });
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [exportedJson, setExportedJson] = useState('');
  const [toast, setToast] = useState('');
  const load = useCallback(async () => {
    const [user, config, items] = await Promise.all([getCurrentUser(), getAdminSettings(), getCategories()]);
    setAdmin(user); setSettings(config); setCategories(items);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveConfig = async () => {
    if (!settings.appName.trim() || !settings.bannerTitle.trim()) { setToast('Tên ứng dụng và tiêu đề banner không được để trống.'); return; }
    await saveAdminSettings({ ...settings, appName: settings.appName.trim(), bannerTitle: settings.bannerTitle.trim(), bannerSubtitle: settings.bannerSubtitle.trim() });
    setToast('Đã lưu cấu hình ứng dụng.');
  };
  const addCategory = async () => {
    if (!categoryName.trim()) return;
    const next = await saveCategories([...categories, categoryName]);
    setCategories(next); setCategoryName(''); setToast('Đã thêm thể loại.');
  };
  const removeCategory = async (item) => {
    const next = await saveCategories(categories.filter((category) => category !== item));
    setCategories(next); setToast('Đã xóa thể loại khỏi danh sách lựa chọn.');
  };
  const restore = async () => {
    await restoreDemoData(); setConfirmRestore(false); await load(); setToast('Đã khôi phục toàn bộ nội dung demo mặc định.');
  };
  const exportData = async () => {
    const json = await exportLocalData();
    setExportedJson(json);
    try { await Share.share({ title: 'Mika Books local data', message: json }); } catch { /* Trình duyệt có thể không hỗ trợ Share. */ }
  };
  const signOut = async () => { await logout(); router.replace('/dang-nhap'); };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <AdminHeader title="Cài đặt Admin" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title="Thiết lập dữ liệu demo" description="Các thiết lập này được lưu riêng trên thiết bị." />
        <AdminFormSection title="Thông tin Admin">
          <View style={styles.profile}>{admin?.avatar ? <Image source={{ uri: admin.avatar }} style={styles.avatar} /> : null}<View><Text style={styles.name}>{admin?.name}</Text><Text style={styles.muted}>{admin?.email}</Text><Text style={styles.demoNote}>Phân quyền local chỉ phục vụ demo, không phải bảo mật thật.</Text></View></View>
          <SecondaryButton title="Chuyển sang giao diện người dùng" icon="phone-portrait-outline" onPress={() => router.push('/trang-chu')} />
        </AdminFormSection>
        <AdminFormSection title="Thương hiệu và banner" description="Trang chủ User sẽ đọc cấu hình này khi mở lại màn hình.">
          <TextField label="Tên ứng dụng" value={settings.appName} onChangeText={(value) => setSettings((current) => ({ ...current, appName: value }))} />
          <TextField label="Tiêu đề banner" value={settings.bannerTitle} onChangeText={(value) => setSettings((current) => ({ ...current, bannerTitle: value }))} />
          <TextField label="Mô tả banner" value={settings.bannerSubtitle} onChangeText={(value) => setSettings((current) => ({ ...current, bannerSubtitle: value }))} multiline numberOfLines={3} />
          <PrimaryButton title="Lưu cấu hình" icon="save-outline" onPress={saveConfig} />
        </AdminFormSection>
        <AdminFormSection title="Danh sách thể loại" description="Thể loại đang dùng trong truyện không bị xóa khỏi dữ liệu truyện cũ.">
          <View style={styles.categoryInput}><View style={{ flex: 1 }}><TextField value={categoryName} onChangeText={setCategoryName} placeholder="Tên thể loại mới" /></View><PrimaryButton title="Thêm" onPress={addCategory} style={{ minWidth: 80, marginBottom: spacing.lg }} /></View>
          <View style={styles.categoryWrap}>{categories.map((item) => <View key={item} style={styles.category}><Text style={styles.categoryText}>{item}</Text><Pressable onPress={() => removeCategory(item)} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.danger} /></Pressable></View>)}</View>
        </AdminFormSection>
        <AdminFormSection title="Dữ liệu local" description="Xuất JSON để kiểm tra hoặc khôi phục dữ liệu seed khi cần.">
          <SecondaryButton title="Xuất dữ liệu JSON" icon="download-outline" onPress={exportData} />
          <DangerButton title="Khôi phục dữ liệu mặc định" icon="refresh-outline" onPress={() => setConfirmRestore(true)} style={{ marginTop: spacing.md }} />
        </AdminFormSection>
        <DangerButton title="Đăng xuất Admin" icon="log-out-outline" onPress={signOut} />
      </ScrollView>
      <ConfirmDialog visible={confirmRestore} title="Khôi phục toàn bộ dữ liệu?" message="Truyện, chương, đánh giá, giao dịch, tin tức và cài đặt demo đã chỉnh sửa sẽ trở về dữ liệu seed. Tài khoản đang đăng nhập được giữ lại." confirmText="Khôi phục" isDanger onConfirm={restore} onCancel={() => setConfirmRestore(false)} />
      <BottomSheet visible={Boolean(exportedJson)} title="Dữ liệu JSON" onClose={() => setExportedJson('')}>
        <ScrollView style={{ maxHeight: 420 }}><Text selectable style={styles.json}>{exportedJson}</Text></ScrollView>
      </BottomSheet>
      <Toast visible={Boolean(toast)} message={toast} type={toast.includes('không') ? 'danger' : 'success'} onDismiss={() => setToast('')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 62, height: 62, borderRadius: 31 },
  name: { ...typography.title, color: colors.text },
  muted: { ...typography.body, color: colors.muted },
  demoNote: { ...typography.caption, color: colors.warning, marginTop: 4, maxWidth: 270 },
  categoryInput: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.round, backgroundColor: colors.surface3 },
  categoryText: { ...typography.caption, color: colors.text, fontWeight: '700' },
  json: { color: colors.muted, fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
});
