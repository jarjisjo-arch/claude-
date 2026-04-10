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
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      const mimeType = (asset.mimeType as 'image/jpeg' | 'image/png') ?? 'image/jpeg';
      if (base64) {
        onImageSelected(base64, mimeType);
      } else {
        Alert.alert('Error', 'Could not read image data.');
      }
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
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      const mimeType = (asset.mimeType as 'image/jpeg' | 'image/png') ?? 'image/jpeg';
      if (base64) {
        onImageSelected(base64, mimeType);
      } else {
        Alert.alert('Error', 'Could not read image data.');
      }
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
