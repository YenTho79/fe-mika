import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { initLocalData, getCurrentUser } from '../services/localDataService';

function AppContent() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isDark, colors } = useTheme();

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
      } catch (error) {
        console.error('Lỗi khi chuẩn bị ứng dụng:', error);
      } finally {
        setIsReady(true);
      }
    }
    
    prepare();
  }, [router, segments]);

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
