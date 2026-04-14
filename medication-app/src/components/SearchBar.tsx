import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder={t.searchPlaceholder}
        placeholderTextColor="#9ca3af"
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
        activeOpacity={0.8}
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
    borderRadius: 50,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
    elevation: 3,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
    paddingLeft: 6,
    paddingRight: 16,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#181c1c',
    paddingVertical: 10,
  },
  inputRTL: {
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#006a61',
    borderRadius: 50,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#5eead4',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
