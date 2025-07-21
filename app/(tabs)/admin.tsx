import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Users, Mail, Calendar, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalQRCodes: 0,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const usersData = JSON.parse((await AsyncStorage.getItem('hrkUsers')) || '{}');
      const usersList = Object.values(usersData);
      setUsers(usersList);

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newUsersThisWeek = usersList.filter(user => 
        new Date(user.signupDate) > oneWeekAgo
      ).length;

      // Calculate total QR codes across all users
      let totalQRCodes = 0;
      for (const user of usersList) {
        try {
          const userHistory = JSON.parse(
            (await AsyncStorage.getItem(`hrkHistory_${user.email}`)) || '[]'
          );
          totalQRCodes += userHistory.length;
        } catch (error) {
          console.error(`Error loading history for ${user.email}:`, error);
        }
      }

      setStats({
        totalUsers: usersList.length,
        newUsersThisWeek,
        totalQRCodes,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Shield size={32} color="#ec4899" />
          <Text style={styles.title}>Admin Panel</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#6366f1" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.newUsersThisWeek}</Text>
            <Text style={styles.statLabel}>New This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <Shield size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{stats.totalQRCodes}</Text>
            <Text style={styles.statLabel}>QR Codes Generated</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Registered Users</Text>
          
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={60} color="#6b7280" />
              <Text style={styles.emptyText}>No users registered yet</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.usersList}
              contentContainerStyle={styles.usersContent}
              showsVerticalScrollIndicator={false}
            >
              {users.map((user, index) => (
                <View key={index} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={styles.userBadge}>
                        <Text style={styles.userBadgeText}>USER</Text>
                      </View>
                    </View>
                    
                    <View style={styles.userDetail}>
                      <Mail size={14} color="#94a3b8" />
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    
                    <View style={styles.userDetail}>
                      <Calendar size={14} color="#94a3b8" />
                      <Text style={styles.userDate}>
                        Joined {formatDate(user.signupDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  usersSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  usersList: {
    flex: 1,
  },
  usersContent: {
    gap: 12,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  userInfo: {
    gap: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  userBadgeText: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: '600',
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    color: '#c7d2fe',
    fontSize: 14,
  },
  userDate: {
    color: '#94a3b8',
    fontSize: 14,
  },
});