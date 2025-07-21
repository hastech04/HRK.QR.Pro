import { Tabs } from 'expo-router';
import { QrCode, ScanLine, Clock, Shield, Chrome as Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#4c1d95', '#7c3aed', '#ec4899']}
            style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#c7d2fe',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ size, color }) => (
            <QrCode size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ size, color }) => (
            <ScanLine size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <Clock size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}