import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../constants/theme';

export function Screen({ children, padded = true, safeAreaTop = true, style }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      styles.screen,
      safeAreaTop && { paddingTop: insets.top },
      padded && styles.padded,
      style
    ]}>
      {children}
    </View>
  );
}

export function Header({ title, onBack, rightIcon, onRight }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
      <Pressable onPress={onBack} style={styles.iconBtn}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <Pressable onPress={onRight} style={styles.iconBtn}>
        {rightIcon ? <Ionicons name={rightIcon} size={22} color={colors.primary} /> : <View style={{ width: 22 }} />}
      </Pressable>
    </View>
  );
}

export function Button({ title, onPress, icon, variant = 'primary', style, disabled }) {
  const isOutline = variant === 'outline';
  return (
    <Pressable 
      onPress={disabled ? null : onPress} 
      style={[
        styles.button, 
        isOutline && styles.outlineButton, 
        disabled && { opacity: 0.6 },
        style
      ]}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, isOutline && styles.outlineButtonText]}>{title}</Text>
      {icon ? <Ionicons name={icon} size={18} color={isOutline ? colors.primary : '#ede0ff'} /> : null}
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive, style]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function BookCard({ book, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.bookCard}>
      <Image source={{ uri: book.cover }} style={styles.bookCover} />
      <Text numberOfLines={1} style={styles.bookTitle}>{book.title}</Text>
      <Text numberOfLines={1} style={styles.bookMeta}>{book.category} • {book.views}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color={colors.tertiary} />
        <Text style={styles.bookMeta}>{book.rating}</Text>
      </View>
    </Pressable>
  );
}

export function BottomNav({ router, active = 'home' }) {
  const items = [
    { key: 'home', label: 'Trang chủ', icon: 'home', route: '/trang-chu' },
    { key: 'featured', label: 'Khám phá', icon: 'search', route: '/noi-bat' },
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

export function SectionTitle({ title, action, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onPress}><Text style={styles.actionText}>{action}</Text></Pressable> : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: 20 },
  header: { height: 64, paddingHorizontal: 20, backgroundColor: 'rgba(11,19,38,0.94)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  headerTitle: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  button: { minHeight: 50, borderRadius: 14, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16, ...shadow },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outline },
  buttonText: { color: '#ede0ff', fontWeight: '800', fontSize: 15 },
  outlineButtonText: { color: colors.primary },
  card: { backgroundColor: 'rgba(34,42,61,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 16, ...shadow },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '700' },
  chipTextActive: { color: '#ede0ff' },
  bookCard: { width: 150, marginRight: 14 },
  bookCover: { width: 150, height: 210, borderRadius: 16, backgroundColor: colors.surface3 },
  bookTitle: { color: colors.text, fontWeight: '800', marginTop: 10, fontSize: 15 },
  bookMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bottomNav: { position: 'absolute', left: 14, right: 14, bottom: 14, height: 70, borderRadius: 24, backgroundColor: 'rgba(23,31,51,0.96)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', ...shadow },
  navItem: { alignItems: 'center', gap: 4, minWidth: 64 },
  navText: { color: colors.outline, fontSize: 11, fontWeight: '700' },
  navTextActive: { color: colors.primary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  actionText: { color: colors.primary, fontWeight: '800' }
});
