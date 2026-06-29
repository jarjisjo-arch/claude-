import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ onSearch, loading, value, onChangeText }: SearchBarProps) {
  const { t, isRTL } = useLanguage();

  const handleSearch = () => {
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="magnify" size={22} color="#6e7977" />
      </View>
      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder={t.searchPlaceholder}
        placeholderTextColor="#bdc9c6"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        textAlign={isRTL ? 'right' : 'left'}
        writingDirection={isRTL ? 'rtl' : 'ltr'}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="close-circle" size={18} color="#bdc9c6" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSearch}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>{t.searchButton}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 4,
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  containerRTL: { flexDirection: 'row-reverse' },
  iconWrap:    { paddingLeft: 14, paddingRight: 2 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#181c1c',
    fontWeight: '500',
    paddingVertical: 12,
  },
  inputRTL:    { textAlign: 'right' },
  clearBtn:    { paddingHorizontal: 4 },
  button: {
    backgroundColor: '#006a61',
    borderRadius: 9999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buttonDisabled: { backgroundColor: '#77d7ca' },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
