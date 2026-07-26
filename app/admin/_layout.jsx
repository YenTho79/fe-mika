import { Slot } from 'expo-router';
import { View } from 'react-native';
import { AdminBottomNav, RoleGuard } from '../../components/AdminUI';

export default function AdminLayout() {
  return (
    <RoleGuard>
      <View style={{ flex: 1 }}>
        <Slot />
        <AdminBottomNav />
      </View>
    </RoleGuard>
  );
}
