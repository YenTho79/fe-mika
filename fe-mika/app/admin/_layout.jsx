import { Slot } from 'expo-router';
import { View } from 'react-native';
import { AdminBottomNav, RoleGuard } from '../../components/AdminUI';
import { useTheme } from '../../hooks/useTheme';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <RoleGuard>
      <View style={{ flex: 1 }}>
        <Slot />
        <AdminBottomNav />
      </View>
    </RoleGuard>
  );
}
