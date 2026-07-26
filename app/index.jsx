import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    async function checkLogin() {
      const user = await AsyncStorage.getItem('mika_user');
      router.replace(user ? '/trang-chu' : '/dang-nhap');
    }
    checkLogin();
  }, []);

  return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
}
