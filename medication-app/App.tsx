import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from './src/context/LanguageContext';
import HomeScreen from './src/screens/HomeScreen';
import DisclaimerScreen from './src/screens/DisclaimerScreen';

const DISCLAIMER_KEY = 'disclaimer_accepted_v1';

export default function App() {
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      setDisclaimerAccepted(val === 'true');
      setDisclaimerChecked(true);
    });
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setDisclaimerAccepted(true);
  };

  if (!disclaimerChecked) return null;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="dark" backgroundColor="#f6faf9" />
        {disclaimerAccepted ? (
          <HomeScreen />
        ) : (
          <DisclaimerScreen onAccept={handleAccept} />
        )}
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
