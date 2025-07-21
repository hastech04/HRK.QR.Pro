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
import QRCode from 'react-native-qrcode-svg';
import { Calendar, Trash2, Eye } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('hrkCurrentUser');
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(currentUser);
      const historyKey = `hrkHistory_${user.email}`;
      const historyData = JSON.parse((await AsyncStorage.getItem(historyKey)) || '[]');
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this QR code from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = await AsyncStorage.getItem('hrkCurrentUser');
              if (!currentUser) return;

              const user = JSON.parse(currentUser);
              const historyKey = `hrkHistory_${user.email}`;
              const currentHistory = JSON.parse((await AsyncStorage.getItem(historyKey)) || '[]');
              const updatedHistory = currentHistory.filter(item => item.id !== id);
              
              await AsyncStorage.setItem(historyKey, JSON.stringify(updatedHistory));
              setHistory(updatedHistory);
            } catch (error) {
              console.error('Error deleting history item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  const clearAllHistory = async () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all QR codes from your history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = await AsyncStorage.getItem('hrkCurrentUser');
              if (!currentUser) return;

              const user = JSON.parse(currentUser);
              const historyKey = `hrkHistory_${user.email}`;
              
              await AsyncStorage.setItem(historyKey, JSON.stringify([]));
              setHistory([]);
              Alert.alert('Success', 'All history has been cleared.');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading history...</Text>
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
          <Text style={styles.title}>Your QR Code History</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllHistory}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Eye size={80} color="#6b7280" />
            <Text style={styles.emptyTitle}>No QR Codes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your generated and scanned QR codes will appear here
            </Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={item.data}
                    size={80}
                    color="#ec4899"
                    backgroundColor="#fff"
                  />
                </View>
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemType}>
                      {item.scanned ? 'Scanned' : 'Generated'} QR Code
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteHistoryItem(item.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.itemData} numberOfLines={3}>
                    {item.data}
                  </Text>
                  
                  <View style={styles.itemFooter}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={styles.itemDate}>
                      {formatDate(item.date)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  clearButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemType: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  itemData: {
    color: '#e0e7ff',
    fontSize: 14,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  itemDate: {
    color: '#94a3b8',
    fontSize: 12,
  },
});