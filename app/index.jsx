import { useMemo,  useTheme } from '../hooks/useTheme';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getCurrentUser, initLocalData } from '../services/localDataService';

export default function Index() {
  const { colors } = useTheme();


  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      await initLocalData();
      const user = await getCurrentUser();
      if (active) router.replace(user ? (user.role === 'admin' ? '/admin' : '/trang-chu') : '/dang-nhap');
    })();
    return () => { active = false; };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
