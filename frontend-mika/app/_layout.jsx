import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await AsyncStorage.getItem('mika_user');
        
        // Define which screens are authentication-related
        const inAuthGroup = segments[0] === 'dang-nhap' || segments[0] === 'dang-ky' || segments[0] === 'login';

        if (user && inAuthGroup) {
          // If logged in and trying to access login/register, redirect to home
          router.replace('/trang-chu');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    }
    
    checkAuth();
  }, [segments]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
