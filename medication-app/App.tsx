import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="light" backgroundColor="#0f766e" />
        <HomeScreen />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
