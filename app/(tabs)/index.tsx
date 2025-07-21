import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { QrCode, ScanLine, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from '../../components/AuthScreen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('hrkCurrentUser');
      if (currentUser) {
        setUser(JSON.parse(currentUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('hrkCurrentUser');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HRK QR Code</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome, {user?.name || 'User'}!
          </Text>
          <Text style={styles.heroTitle}>
            Scan. Generate. Share – Instantly.
          </Text>
          <Text style={styles.heroSubtitle}>
            Your mobile QR code companion. Generate QR codes from text, URLs, or vCards, 
            and scan codes using your camera - all offline and secure.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.generateButton]}
            onPress={() => router.push('/generate')}
          >
            <LinearGradient
              colors={['#ec4899', '#f97316']}
              style={styles.buttonGradient}
            >
              <QrCode size={32} color="#fff" />
              <Text style={styles.buttonText}>Generate QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.scanButton]}
            onPress={() => router.push('/scan')}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.buttonGradient}
            >
              <ScanLine size={32} color="#fff" />
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Feature Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://png.pngtree.com/png-clipart/20220729/original/pngtree-qr-code-png-image_8438558.png',
            }}
            style={styles.featureImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e0e7ff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 16,
    color: '#c7d2fe',
    marginBottom: 8,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#c7d2fe',
    lineHeight: 24,
  },
  actionContainer: {
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  generateButton: {},
  scanButton: {},
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  featureImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
});