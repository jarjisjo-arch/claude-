import React, { useState } from 'react';
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
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
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
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        textAlign={isRTL ? 'right' : 'left'}
        writingDirection={isRTL ? 'rtl' : 'ltr'}
        autoCorrect={false}
        autoCapitalize="none"
      />
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
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  iconWrap: {
    paddingLeft: 14,
    paddingRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#181c1c',
    fontWeight: '500',
    paddingVertical: 12,
  },
  inputRTL: {
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#006a61',
    borderRadius: 9999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buttonDisabled: {
    backgroundColor: '#77d7ca',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
