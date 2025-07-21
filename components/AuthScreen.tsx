import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const hashPassword = (password) => {
    return btoa(password);
  };

  const handleSignup = async () => {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const users = JSON.parse((await AsyncStorage.getItem('hrkUsers')) || '{}');
      
      if (users[email.toLowerCase()]) {
        Alert.alert('Error', 'An account with this email already exists.');
        return;
      }

      const passwordHash = hashPassword(password);
      const signupDate = new Date().toISOString();
      const userData = {
        name,
        email: email.toLowerCase(),
        passwordHash,
        signupDate,
      };

      users[email.toLowerCase()] = userData;
      await AsyncStorage.setItem('hrkUsers', JSON.stringify(users));

      setShowThankYou(true);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      const users = JSON.parse((await AsyncStorage.getItem('hrkUsers')) || '{}');
      const userKey = email.toLowerCase();

      if (!users[userKey]) {
        Alert.alert('Error', 'No account found with this email.');
        return;
      }

      const passwordHash = hashPassword(password);
      if (users[userKey].passwordHash !== passwordHash) {
        Alert.alert('Error', 'Incorrect password.');
        return;
      }

      await AsyncStorage.setItem('hrkCurrentUser', JSON.stringify(users[userKey]));
      onAuthSuccess(users[userKey]);
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const handleThankYouLogin = () => {
    setShowThankYou(false);
    setIsLogin(true);
  };

  if (showThankYou) {
    return (
      <LinearGradient
        colors={['#312e81', '#7c3aed', '#ec4899']}
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.thankYouContainer}>
          <View style={styles.thankYouCard}>
            <CheckCircle size={80} color="#10b981" />
            <Text style={styles.thankYouTitle}>Thank you for signing up!</Text>
            <Text style={styles.thankYouSubtitle}>
              Your account has been created successfully.
            </Text>
            <TouchableOpacity style={styles.proceedButton} onPress={handleThankYouLogin}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Proceed to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#312e81', '#7c3aed', '#ec4899']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.authCard}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#a5b4fc"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#a5b4fc"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#a5b4fc"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  authCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 24,
    padding: 32,
    marginVertical: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    color: '#c7d2fe',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  thankYouContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  thankYouCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  thankYouTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  thankYouSubtitle: {
    color: '#c7d2fe',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  proceedButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
});