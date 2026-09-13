import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { initLocalData, getCurrentUser } from '../services/localDataService';
import {
  configureNotificationHandler,
  registerForPushNotifications,
} from '../services/notificationService';

// Safe-load expo-notifications để không crash trong Expo Go
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (_) {}

// Cấu hình handler hiển thị thông báo ngay khi app đang chạy
configureNotificationHandler();

function AppContent() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isDark, colors } = useTheme();
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    async function prepare() {
      try {
        await initLocalData();
        const user = await getCurrentUser();
        const currentRoute = segments[0];
        const inAuthGroup = currentRoute === 'dang-nhap' || currentRoute === 'dang-ky';
        const isPublicRoute = !currentRoute || inAuthGroup;
        if (user && inAuthGroup) {
          router.replace(user.role === 'admin' ? '/admin' : '/trang-chu');
        } else if (!user && !isPublicRoute) {
          router.replace('/dang-nhap');
        }

        // Đăng ký push token nếu user đã đăng nhập
        if (user?.token) {
          registerForPushNotifications(user.token).catch(() => {});
        }
      } catch (error) {
        console.error('Lỗi khi chuẩn bị ứng dụng:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, [router, segments]);

  // Listener điều hướng khi user bấm vào thông báo
  useEffect(() => {
    if (!Notifications) return; // Expo Go — không có push notification

    // Lắng nghe khi user bấm vào notification (app đang nền hoặc đóng)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.route) {
        try {
          router.push({
            pathname: data.route,
            params: data.params || {},
          });
        } catch (navErr) {
          console.warn('[push] Không điều hướng được:', navErr);
        }
      }
    });

    // Lắng nghe thông báo đến khi app đang mở (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[push] Nhận thông báo foreground:', notification.request.content.title);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
