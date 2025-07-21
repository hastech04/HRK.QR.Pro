import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Image,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import { Download, Share as ShareIcon, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function GenerateScreen() {
  const [qrType, setQrType] = useState('text');
  const [qrData, setQrData] = useState('');
  const [vCardData, setVCardData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    website: '',
  });
  const [qrValue, setQrValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [qrRef, setQrRef] = useState(null);

  const generateQRCode = async () => {
    let data = '';

    if (qrType === 'text') {
      data = qrData.trim();
      if (!data) {
        Alert.alert('Error', 'Please enter text to generate QR code.');
        return;
      }
    } else if (qrType === 'url') {
      data = qrData.trim();
      if (!data) {
        Alert.alert('Error', 'Please enter a URL to generate QR code.');
        return;
      }
      try {
        new URL(data);
      } catch {
        Alert.alert('Error', 'Please enter a valid URL.');
        return;
      }
    } else if (qrType === 'vcard') {
      const { name, phone, email, company, title, website } = vCardData;
      if (!name && !phone && !email && !company && !title && !website) {
        Alert.alert('Error', 'Please enter at least one vCard field.');
        return;
      }
      data = `BEGIN:VCARD\nVERSION:3.0\n`;
      if (name) data += `FN:${name}\n`;
      if (title) data += `TITLE:${title}\n`;
      if (company) data += `ORG:${company}\n`;
      if (phone) data += `TEL;TYPE=WORK,VOICE:${phone}\n`;
      if (email) data += `EMAIL:${email}\n`;
      if (website) data += `URL:${website}\n`;
      data += `END:VCARD`;
    }

    setQrValue(data);
    setShowModal(true);
    saveToHistory(data);
  };

  const saveToHistory = async (data) => {
    try {
      const currentUser = await AsyncStorage.getItem('hrkCurrentUser');
      if (!currentUser) return;

      const user = JSON.parse(currentUser);
      const historyKey = `hrkHistory_${user.email}`;
      const history = JSON.parse((await AsyncStorage.getItem(historyKey)) || '[]');
      
      const entry = {
        id: Date.now(),
        data,
        scanned: false,
        date: new Date().toISOString(),
      };
      
      history.unshift(entry);
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to save images to your gallery.');
        return;
      }

      if (qrRef) {
        qrRef.toDataURL((dataURL) => {
          const filename = FileSystem.documentDirectory + `qr-code-${Date.now()}.png`;
          FileSystem.writeAsStringAsync(filename, dataURL, {
            encoding: FileSystem.EncodingType.Base64,
          }).then(() => {
            MediaLibrary.saveToLibraryAsync(filename);
            Alert.alert('Success', 'QR Code saved to gallery!');
          });
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code.');
      console.error('Download error:', error);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Check out this QR code: ${qrValue}`,
      title: 'HRK QR Code',
    });
  };

  const renderInputFields = () => {
    switch (qrType) {
      case 'text':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Text</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter any text to encode"
              placeholderTextColor="#a5b4fc"
              value={qrData}
              onChangeText={setQrData}
              multiline
              numberOfLines={3}
            />
          </View>
        );
      case 'url':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              placeholderTextColor="#a5b4fc"
              value={qrData}
              onChangeText={setQrData}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        );
      case 'vcard':
        return (
          <View style={styles.vCardContainer}>
            <Text style={styles.label}>vCard Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#a5b4fc"
              value={vCardData.name}
              onChangeText={(text) => setVCardData({ ...vCardData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#a5b4fc"
              value={vCardData.phone}
              onChangeText={(text) => setVCardData({ ...vCardData, phone: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#a5b4fc"
              value={vCardData.email}
              onChangeText={(text) => setVCardData({ ...vCardData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              placeholderTextColor="#a5b4fc"
              value={vCardData.company}
              onChangeText={(text) => setVCardData({ ...vCardData, company: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              placeholderTextColor="#a5b4fc"
              value={vCardData.title}
              onChangeText={(text) => setVCardData({ ...vCardData, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Website"
              placeholderTextColor="#a5b4fc"
              value={vCardData.website}
              onChangeText={(text) => setVCardData({ ...vCardData, website: text })}
              autoCapitalize="none"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Generate QR Code</Text>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select QR Code Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={qrType}
                onValueChange={setQrType}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Text" value="text" color="#ffffff" />
                <Picker.Item label="URL" value="url" color="#ffffff" />
                <Picker.Item label="vCard" value="vcard" color="#ffffff" />
              </Picker>
            </View>
          </View>

          {renderInputFields()}

          <TouchableOpacity style={styles.generateButton} onPress={generateQRCode}>
            <LinearGradient
              colors={['#ec4899', '#f97316']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Generate QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* QR Code Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue}
                  size={280}
                  color="#ec4899"
                  backgroundColor="#fff"
                  getRef={(c) => setQrRef(c)}
                />
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDownload}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.actionButtonGradient}
                  >
                    <Download size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.actionButtonGradient}
                  >
                    <ShareIcon size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ec4899',
    textAlign: 'center',
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 24,
    padding: 24,
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
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    height: 50,
    backgroundColor: 'transparent',
  },
  vCardContainer: {
    gap: 12,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    gap: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});