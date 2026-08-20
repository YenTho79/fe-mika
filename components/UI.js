import { useMemo,  useTheme } from '../hooks/useTheme';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadow, shadowSmall, radius, spacing } from '../constants/theme';

// ================= LAYOUT COMPONENTS =================

export function Screen({ children, padded = true, safeAreaTop = true, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        safeAreaTop && { paddingTop: insets.top },
        padded && styles.padded,
        style
      ]}
    >
      {children}
    </View>
  );
}

export function AppHeader({ title, onBack, rightIcon, onRight, rightElement, subtitle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressedState]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      <View style={styles.headerRight}>
        {rightElement ? (
          rightElement
        ) : rightIcon ? (
          <Pressable
            onPress={onRight}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressedState]}
          >
            <Ionicons name={rightIcon} size={22} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}

export const Header = AppHeader;

export function Card({ children, style, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressedState, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ================= BUTTON COMPONENTS =================

export function PrimaryButton({ title, onPress, icon, disabled, loading, style, textStyle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable
      onPress={disabled || loading ? null : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.buttonText} />
      ) : (
        <>
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          {icon ? <Ionicons name={icon} size={18} color={colors.buttonText} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, icon, disabled, loading, style, textStyle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable
      onPress={disabled || loading ? null : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Text style={[styles.buttonText, { color: colors.primary }, textStyle]}>{title}</Text>
          {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function DangerButton({ title, onPress, icon, disabled, loading, style, textStyle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable
      onPress={disabled || loading ? null : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles.dangerButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <>
          <Text style={[styles.buttonText, { color: colors.white }, textStyle]}>{title}</Text>
          {icon ? <Ionicons name={icon} size={18} color={colors.white} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Button({ title, onPress, icon, variant = 'primary', style, disabled, loading, textStyle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
if (variant === 'secondary' || variant === 'outline') {
    return <SecondaryButton title={title} onPress={onPress} icon={icon} disabled={disabled} loading={loading} style={style} textStyle={textStyle} />;
  }
  if (variant === 'danger') {
    return <DangerButton title={title} onPress={onPress} icon={icon} disabled={disabled} loading={loading} style={style} textStyle={textStyle} />;
  }
  return <PrimaryButton title={title} onPress={onPress} icon={icon} disabled={disabled} loading={loading} style={style} textStyle={textStyle} />;
}

// ================= FORM & INPUT COMPONENTS =================

export function FormField({ label, error, required, children, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label ? (
        <Text style={styles.formLabel}>
          {label} {required ? <Text style={{ color: colors.danger }}>*</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? <Text style={styles.formErrorText}>{error}</Text> : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  disabled,
  style,
  inputStyle,
  multiline,
  numberOfLines,
  ...props
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <FormField label={label} error={error}>
      <View
        style={[
          styles.inputContainer,
          error && styles.inputErrorBorder,
          disabled && styles.inputDisabled,
          multiline && { height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingTop: 12 },
          style
        ]}
      >
        {icon ? <Ionicons name={icon} size={20} color={colors.outline} style={{ marginRight: 10 }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.inputField, multiline && { textAlignVertical: 'top' }, inputStyle]}
          {...props}
        />
      </View>
    </FormField>
  );
}

export function PasswordField({ label = 'Mật khẩu', value, onChangeText, placeholder = '••••••••', error, disabled, style, ...props }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const [showPassword, setShowPassword] = useState(false);
  return (
    <FormField label={label} error={error}>
      <View style={[styles.inputContainer, error && styles.inputErrorBorder, disabled && styles.inputDisabled, style]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.outline} style={{ marginRight: 10 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={!showPassword}
          editable={!disabled}
          style={[styles.inputField, { flex: 1 }]}
          {...props}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primary} />
        </Pressable>
      </View>
    </FormField>
  );
}

export function SearchField({ value, onChangeText, onClear, placeholder = 'Tìm kiếm truyện, tác giả...', style, ...props }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <View style={[styles.inputContainer, styles.searchContainer, style]}>
      <Ionicons name="search" size={20} color={colors.outline} style={{ marginRight: 10 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        style={[styles.inputField, { flex: 1 }]}
        {...props}
      />
      {value ? (
        <Pressable onPress={onClear || (() => onChangeText(''))}>
          <Ionicons name="close-circle" size={18} color={colors.outline} />
        </Pressable>
      ) : null}
    </View>
  );
}

// ================= BOOK & LIST COMPONENTS =================

export function BookCard({ book, onPress, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
if (!book) return null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bookCard, pressed && styles.pressedState, style]}
    >
      <Image source={{ uri: book.cover }} style={styles.bookCover} resizeMode="cover" />
      <Text numberOfLines={1} style={styles.bookTitle}>
        {book.title}
      </Text>
      <Text numberOfLines={1} style={styles.bookMeta}>
        {Array.isArray(book.categories) ? book.categories.join(', ') : book.category || 'Mika'}
      </Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color={colors.tertiary} />
        <Text style={styles.bookRatingText}>{book.rating || '5.0'}</Text>
        <Text style={styles.bookViewsText}>• {book.views || '0'} lượt xem</Text>
      </View>
    </Pressable>
  );
}

export function BookListItem({ book, onPress, onLongPress, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
if (!book) return null;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.bookListItem, pressed && styles.pressedState, style]}
    >
      <Image source={{ uri: book.cover }} style={styles.bookListItemCover} resizeMode="cover" />
      <View style={styles.bookListItemInfo}>
        <Text numberOfLines={1} style={styles.bookListItemTitle}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={styles.bookListItemAuthor}>
          Tác giả: {book.author || 'Đang cập nhật'}
        </Text>
        <Text numberOfLines={2} style={styles.bookListItemDesc}>
          {book.description || 'Chưa có mô tả chi tiết cho bộ truyện này.'}
        </Text>
        <View style={styles.bookListItemFooter}>
          <StatusBadge status={book.status || 'Đang ra'} />
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.tertiary} />
            <Text style={styles.bookRatingText}>{book.rating || '5.0'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function ChapterListItem({ chapter, onPress, isRead, isCurrent, isLocked, isUnlocked = false, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
if (!chapter) return null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chapterItem,
        isCurrent && styles.chapterItemCurrent,
        pressed && styles.pressedState,
        style
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={[
            styles.chapterTitle,
            isCurrent && { color: colors.primary, fontWeight: '800' },
            isRead && !isCurrent && { color: colors.outline }
          ]}
        >
          Chương {chapter.number}: {chapter.title}
        </Text>
        <Text style={styles.chapterDate}>{chapter.publishedAt || 'Vừa xong'}</Text>
      </View>
      {(chapter.locked || isLocked) && !isUnlocked ? (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={14} color={colors.warning} />
          {chapter.coinPrice ? <Text style={styles.lockText}>{chapter.coinPrice} xu</Text> : null}
        </View>
      ) : isUnlocked && chapter.locked ? (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-open" size={14} color={colors.tertiary} />
          <Text style={[styles.lockText, { color: colors.tertiary }]}>Đã mở</Text>
        </View>
      ) : isRead ? (
        <Ionicons name="checkmark-circle" size={18} color={colors.tertiary} />
      ) : (
        <View style={styles.lockBadge}>
          <Ionicons name="gift-outline" size={14} color={colors.tertiary} />
          <Text style={[styles.lockText, { color: colors.tertiary }]}>Miễn phí</Text>
        </View>
      )}
    </Pressable>
  );
}

// ================= BADGES, CHIPS & HEADERS =================

export function SectionHeader({ title, action, onPress, subtitle, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <View style={[styles.sectionHeader, style]}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressedState]}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const SectionTitle = SectionHeader;

export function FilterChip({ label, active, onPress, count, icon, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressedState,
        style
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? colors.chipActiveText : colors.muted} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {count !== undefined ? (
        <View style={[styles.chipCount, active && styles.chipCountActive]}>
          <Text style={[styles.chipCountText, active && { color: colors.primaryContainer }]}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const Chip = FilterChip;

export function StatusBadge({ status, label, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
let badgeColor = colors.surface3;
  let textColor = colors.text;
  let statusText = label || status || 'Bình thường';

  if (status === 'active' || status === 'Full' || status === 'Hoàn thành' || status === 'completed' || status === 'success' || status === 'published' || status === 'approved') {
    badgeColor = 'rgba(78, 206, 105, 0.15)';
    textColor = colors.success;
  } else if (status === 'warning' || status === 'Đang ra' || status === 'pending' || status === 'Bản nháp' || status === 'draft' || status === 'Tạm dừng') {
    badgeColor = 'rgba(255, 183, 77, 0.15)';
    textColor = colors.warning;
  } else if (status === 'danger' || status === 'disabled' || status === 'locked' || status === 'blocked' || status === 'hidden' || status === 'failed') {
    badgeColor = 'rgba(255, 180, 171, 0.15)';
    textColor = colors.danger;
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: badgeColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{statusText}</Text>
    </View>
  );
}

// ================= FEEDBACK & EMPTY STATES =================

export function EmptyState({ icon = 'folder-open-outline', title = 'Chưa có dữ liệu', message = 'Hiện tại chưa có thông tin nào để hiển thị ở đây.', actionTitle, onAction, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <View style={[styles.emptyContainer, style]}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name={icon} size={42} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionTitle && onAction ? (
        <PrimaryButton title={actionTitle} onPress={onAction} style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

export function ErrorState({ title = 'Có lỗi xảy ra', message = 'Không thể nạp dữ liệu. Vui lòng thử lại sau.', onRetry, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <View style={[styles.emptyContainer, style]}>
      <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(255, 180, 171, 0.15)' }]}>
        <Ionicons name="alert-circle-outline" size={42} color={colors.danger} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {onRetry ? (
        <SecondaryButton title="Thử lại" icon="refresh" onPress={onRetry} style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

export function LoadingSkeleton({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: Platform.OS !== 'web' })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface3,
          opacity
        },
        style
      ]}
    />
  );
}

// ================= MODALS & OVERLAYS =================

export function ConfirmDialog({ visible, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm, onCancel, isDanger }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.dialogBox}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogMessage}>{message}</Text> : null}
          <View style={styles.dialogActions}>
            <SecondaryButton title={cancelText} onPress={onCancel} style={{ flex: 1 }} />
            {isDanger ? (
              <DangerButton title={confirmText} onPress={onConfirm} style={{ flex: 1 }} />
            ) : (
              <PrimaryButton title={confirmText} onPress={onConfirm} style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

}

export function BottomSheet({ visible, onClose, title, children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.bottomSheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.bottomSheetBox, { paddingBottom: Math.max(20, insets.bottom) }]}>
          <View style={styles.bottomSheetHandle} />
          {title ? (
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{title}</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function Toast({ visible, message, type = 'info', onDismiss }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  useEffect(() => {
    if (!visible || !onDismiss) return undefined;
    const timer = setTimeout(onDismiss, 2600);
    return () => clearTimeout(timer);
  }, [onDismiss, visible]);

  if (!visible) return null;
  let bg = colors.surface2;
  let iconName = 'information-circle';
  let iconColor = colors.primary;

  if (type === 'success') {
    bg = 'rgba(78, 206, 105, 0.95)';
    iconName = 'checkmark-circle';
    iconColor = '#ffffff';
  } else if (type === 'danger') {
    bg = 'rgba(255, 114, 114, 0.95)';
    iconName = 'alert-circle';
    iconColor = '#ffffff';
  }

  return (
    <View style={[styles.toastContainer, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={20} color={iconColor} style={{ marginRight: 8 }} />
      <Text style={[styles.toastText, (type === 'success' || type === 'danger') && { color: '#ffffff' }]}>
        {message}
      </Text>
    </View>
  );
}

// ================= ADMIN COMPONENTS =================

export function StatCard({ title, value, change, icon, color, style, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const bgColor = color || colors.primaryContainer;
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={[styles.card, styles.statCard, style]}>
      <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
        <Ionicons name={icon || 'analytics'} size={22} color={colors.buttonText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        {change ? <Text style={styles.statChange}>{change}</Text> : null}
      </View>
    </Wrapper>
  );
}

export function ImagePickerPlaceholder({ uri, onPress, label = 'Tải ảnh lên', style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
return (
    <Pressable onPress={onPress} style={[styles.imagePickerBox, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.imagePickerPreview} resizeMode="cover" />
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
          <Text style={styles.imagePickerLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ================= NAVIGATION COMPONENT =================

export function BottomNav({ router, active = 'home' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
const items = [
    { key: 'home', label: 'Trang chủ', icon: 'home', route: '/trang-chu' },
    { key: 'featured', label: 'Khám phá', icon: 'compass', route: '/kham-pha' },
    { key: 'new', label: 'Sách mới', icon: 'library', route: '/sach-moi' },
    { key: 'account', label: 'Tôi', icon: 'person', route: '/tai-khoan' }
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map(item => (
        <Pressable key={item.key} onPress={() => router.push(item.route)} style={styles.navItem}>
          <Ionicons name={item.icon} size={22} color={active === item.key ? colors.primary : colors.outline} />
          <Text style={[styles.navText, active === item.key && styles.navTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ================= STYLES =================

export const getStyles = (colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: 20 },
  pressedState: { opacity: 0.75 },

  // Header
  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  headerLeft: { width: 40, alignItems: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.iconBtnBg
  },

  // Card
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow
  },

  // Buttons
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16
  },
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.primary },
  dangerButton: { backgroundColor: colors.dangerContainer },
  disabledButton: { opacity: 0.5 },
  pressedButton: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonText: { color: colors.buttonText, fontWeight: '800', fontSize: 15 },

  // Form Inputs
  formLabel: { color: colors.muted, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  formErrorText: { color: colors.danger, fontSize: 12, marginTop: 4, fontWeight: '600' },
  inputContainer: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputErrorBorder: { borderColor: colors.danger },
  inputDisabled: { opacity: 0.5, backgroundColor: colors.surface },
  inputField: {
    ...Platform.select({ web: { outlineStyle: 'none' } }),
    flex: 1,
    color: colors.text,
    fontSize: 15
  },
  searchContainer: { backgroundColor: colors.surface2, borderRadius: radius.round },
  eyeBtn: { padding: 4 },

  // Books & Chapters
  bookCard: { width: 140, marginRight: 14 },
  bookCover: { width: 140, height: 195, borderRadius: radius.md, backgroundColor: colors.surface3 },
  bookTitle: { color: colors.text, fontWeight: '800', marginTop: 8, fontSize: 14 },
  bookMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bookRatingText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  bookViewsText: { color: colors.muted, fontSize: 11 },

  bookListItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  bookListItemCover: { width: 80, height: 115, borderRadius: radius.sm, backgroundColor: colors.surface3 },
  bookListItemInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  bookListItemTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  bookListItemAuthor: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  bookListItemDesc: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  bookListItemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },

  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  chapterItemCurrent: { backgroundColor: colors.highlightBg, borderColor: colors.primaryContainer },
  chapterTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chapterDate: { color: colors.muted, fontSize: 11, marginTop: 2 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { color: colors.warning, fontSize: 12, fontWeight: '700' },

  // Chips & Badges
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  actionText: { color: colors.primary, fontWeight: '800', fontSize: 14 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8
  },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: colors.white },
  chipCount: { backgroundColor: colors.chipCountBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 6 },
  chipCountActive: { backgroundColor: colors.chipCountActiveBg },
  chipCountText: { color: colors.text, fontSize: 11, fontWeight: '800' },

  badgeContainer: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '800' },

  // Empty & Feedback States
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.emptyCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyMessage: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Dialogs & Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  dialogBox: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, ...shadow },
  dialogTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  dialogMessage: { color: colors.muted, fontSize: 14, marginTop: 8, lineHeight: 20 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 20 },

  bottomSheetBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    ...shadow
  },
  bottomSheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16, opacity: 0.5 },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bottomSheetTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },

  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadowSmall,
    zIndex: 9999
  },
  toastText: { color: colors.text, fontWeight: '700', fontSize: 14 },

  // Admin
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12 },
  statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statTitle: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  statChange: { color: colors.tertiary, fontSize: 12, fontWeight: '700', marginTop: 2 },

  imagePickerBox: {
    height: 160,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    overflow: 'hidden'
  },
  imagePickerPreview: { width: '100%', height: '100%' },
  imagePickerLabel: { color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 8 },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.navBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadow
  },
  navItem: { alignItems: 'center', gap: 4, minWidth: 64 },
  navText: { color: colors.outline, fontSize: 11, fontWeight: '700' },
  navTextActive: { color: colors.primary }
});
