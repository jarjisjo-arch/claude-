import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchAnnouncement, Announcement } from '../services/notificationService';

const DISMISSED_KEY = 'announcement_dismissed_id';

const THEME = {
  info:    { bg: '#e8f5f3', border: '#006a61', icon: 'bell-outline'        as const, tint: '#006a61' },
  update:  { bg: '#eef4ff', border: '#2563eb', icon: 'rocket-launch-outline' as const, tint: '#2563eb' },
  warning: { bg: '#fff5f5', border: '#ba1a1a', icon: 'alert-outline'       as const, tint: '#ba1a1a' },
};

interface Props {
  language: string;
  isRTL: boolean;
}

export default function AnnouncementBanner({ language, isRTL }: Props) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await fetchAnnouncement();
      if (!active || !data || !data.show) return;
      const dismissed = await AsyncStorage.getItem(DISMISSED_KEY);
      if (dismissed === data.id) return;   // user already closed this exact message
      setAnnouncement(data);
    })();
    return () => { active = false; };
  }, []);

  if (!announcement) return null;

  const theme = THEME[announcement.type ?? 'info'] ?? THEME.info;
  const title   = language === 'ar' && announcement.titleAr   ? announcement.titleAr   : announcement.title;
  const message = language === 'ar' && announcement.messageAr ? announcement.messageAr : announcement.message;

  const dismiss = async () => {
    await AsyncStorage.setItem(DISMISSED_KEY, announcement.id);
    setAnnouncement(null);
  };

  const onPress = () => {
    if (announcement.link) Linking.openURL(announcement.link).catch(() => {});
  };

  return (
    <TouchableOpacity
      activeOpacity={announcement.link ? 0.8 : 1}
      onPress={onPress}
      style={[styles.banner, { backgroundColor: theme.bg, borderColor: theme.border }, isRTL && styles.rowRev]}
    >
      <MaterialCommunityIcons name={theme.icon} size={22} color={theme.tint} style={styles.icon} />
      <View style={styles.textWrap}>
        {!!title && (
          <Text style={[styles.title, { color: theme.tint }, isRTL && styles.rtl]}>{title}</Text>
        )}
        {!!message && (
          <Text style={[styles.message, isRTL && styles.rtl]}>{message}</Text>
        )}
      </View>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialCommunityIcons name="close" size={18} color="#6e7977" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 14,
  },
  rowRev:   { flexDirection: 'row-reverse' },
  rtl:      { textAlign: 'right', writingDirection: 'rtl' },
  icon:     { marginTop: 1 },
  textWrap: { flex: 1, gap: 2 },
  title:    { fontSize: 14, fontWeight: '800' },
  message:  { fontSize: 13, color: '#3e4947', lineHeight: 19 },
});
