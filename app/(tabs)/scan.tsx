import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Image as ImageIcon, Square } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jsQR from 'jsqr';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

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
        scanned: true,
        date: new Date().toISOString(),
      };
      
      history.unshift(entry);
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    if (!scanning) return;
    
    setScanning(false);
    setScannedData(data);
    setShowCamera(false);
    saveToHistory(data);
    Alert.alert('QR Code Scanned', data, [
      { text: 'OK', onPress: () => {} }
    ]);
  };

  const startCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
        return;
      }
    }
    
    setShowCamera(true);
    setScanning(true);
    setScannedData('');
  };

  const stopCamera = () => {
    setShowCamera(false);
    setScanning(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to scan QR codes from images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      await processImage(imageUri);
    }
  };

  const processImage = async (imageUri) => {
    try {
      // Create a canvas to process the image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create an Image object
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setScannedData(code.data);
          saveToHistory(code.data);
          Alert.alert('QR Code Found', code.data);
        } else {
          Alert.alert('No QR Code Found', 'No QR code was detected in the selected image.');
        }
      };
      
      img.src = imageUri;
    } catch (error) {
      Alert.alert('Error', 'Failed to process the image.');
      console.error('Image processing error:', error);
    }
  };

  if (!permission) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Text style={styles.message}>Loading camera...</Text>
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
        <Text style={styles.title}>Scan QR Code</Text>

        {showCamera ? (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={facing}
              onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
              ref={cameraRef}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <Square size={200} color="#ec4899" strokeWidth={3} />
                </View>
                <Text style={styles.scanInstruction}>
                  Position QR code within the frame
                </Text>
              </View>
            </CameraView>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.controlButton} onPress={stopCamera}>
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Stop Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.scanOptions}>
            <View style={styles.optionCard}>
              <Camera size={60} color="#ec4899" />
              <Text style={styles.optionTitle}>Scan with Camera</Text>
              <Text style={styles.optionDescription}>
                Use your device camera to scan QR codes in real-time
              </Text>
              <TouchableOpacity style={styles.optionButton} onPress={startCamera}>
                <LinearGradient
                  colors={['#ec4899', '#f97316']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Start Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.optionCard}>
              <ImageIcon size={60} color="#6366f1" />
              <Text style={styles.optionTitle}>Upload Image</Text>
              <Text style={styles.optionDescription}>
                Select an image from your gallery containing a QR code
              </Text>
              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Choose Image</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {scannedData ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Scanned Result</Text>
            <Text style={styles.resultText} selectable>
              {scannedData}
            </Text>
          </View>
        ) : null}
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
  message: {
    color: '#e0e7ff',
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ec4899',
    textAlign: 'center',
    marginBottom: 30,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cameraControls: {
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  controlButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanOptions: {
    gap: 20,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    gap: 16,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: '#c7d2fe',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 140,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    color: '#ec4899',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultText: {
    color: '#e0e7ff',
    fontSize: 16,
    lineHeight: 22,
  },
});