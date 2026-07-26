import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';
import { initLocalData, getCurrentUser } from '../services/localDataService';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background || '#121212' }}>
        <ActivityIndicator size="large" color={colors.primary || '#FF6B00'} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
