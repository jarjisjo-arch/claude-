import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '../context/LanguageContext';

interface ImagePickerButtonProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  loading: boolean;
}

export default function ImagePickerButton({ onImageSelected, loading }: ImagePickerButtonProps) {
  const { t, isRTL } = useLanguage();

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('', t.permissionDenied);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('', t.permissionDenied);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Detect mime type from extension; default to jpeg
      const ext = uri.split('.').pop()?.toLowerCase();
      const mimeType =
        ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
      onImageSelected(base64, mimeType);
    } catch {
      Alert.alert('Error', 'Failed to process image.');
    }
  };

  return (
    <View style={[styles.row, isRTL && styles.rowRTL]}>
      <TouchableOpacity
        style={[styles.button, styles.cameraButton, loading && styles.disabled]}
        onPress={takePhoto}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#0f766e" />
        ) : (
          <>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.buttonText}>{t.cameraButton}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.galleryButton, loading && styles.disabled]}
        onPress={pickFromGallery}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#0f766e" />
        ) : (
          <>
            <Text style={styles.icon}>🖼️</Text>
            <Text style={styles.buttonText}>{t.galleryButton}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
  },
  cameraButton: {
    backgroundColor: '#f0fdfa',
    borderColor: '#5eead4',
  },
  galleryButton: {
    backgroundColor: '#f0fdfa',
    borderColor: '#5eead4',
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 18,
  },
  buttonText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
});
