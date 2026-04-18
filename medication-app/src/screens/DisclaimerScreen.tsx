import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onAccept: () => void;
}

export default function DisclaimerScreen({ onAccept }: Props) {
  const [accepted, setAccepted] = useState(false);
  const insets = useSafeAreaInsets();

  const points = [
    {
      icon: 'robot-outline' as const,
      title: 'AI-Powered Tool',
      body: 'Pregna AI uses artificial intelligence to identify medications and retrieve safety classifications. Like all AI systems, it may occasionally produce inaccurate or incomplete results.',
    },
    {
      icon: 'stethoscope' as const,
      title: 'Not a Substitute for Medical Advice',
      body: 'The information provided is for general educational purposes only. It does not constitute medical advice, diagnosis, or treatment, and must not replace consultation with a qualified healthcare professional.',
    },
    {
      icon: 'account-heart-outline' as const,
      title: 'Always Consult Your Healthcare Provider',
      body: 'Before taking, adjusting, or stopping any medication during pregnancy, always speak with your doctor or pharmacist. Never disregard professional medical advice based on information from this app.',
    },
    {
      icon: 'flag-outline' as const,
      title: 'Australian Classification System',
      body: 'Medication safety ratings are based on the Australian Drug Evaluation Committee (ADEC) categorisation system for prescribing medicines in pregnancy — a globally recognised framework used by healthcare professionals worldwide.',
    },
    {
      icon: 'tune-variant' as const,
      title: 'Individual Circumstances Vary',
      body: 'Safety profiles may differ based on trimester, dosage, medical history, and other individual factors. This app provides general guidance only.',
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-alert-outline" size={32} color="#006a61" />
        </View>
        <Text style={styles.title}>Before You Begin</Text>
        <Text style={styles.subtitle}>
          Please read this important information carefully.
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {points.map(({ icon, title, body }) => (
          <View key={title} style={styles.point}>
            <View style={styles.pointIcon}>
              <MaterialCommunityIcons name={icon} size={20} color="#006a61" />
            </View>
            <View style={styles.pointText}>
              <Text style={styles.pointTitle}>{title}</Text>
              <Text style={styles.pointBody}>{body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.closing}>
          By proceeding, you acknowledge that Pregna AI is a reference tool only and that all medical decisions should be made in consultation with a qualified healthcare provider.
        </Text>
      </ScrollView>

      {/* Accept row + button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 24) }]}>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted(v => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted && (
              <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
            )}
          </View>
          <Text style={styles.checkLabel}>
            I have read and accept this disclaimer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, !accepted && styles.btnDisabled]}
          onPress={accepted ? onAccept : undefined}
          activeOpacity={accepted ? 0.85 : 1}
        >
          <Text style={styles.btnText}>Get Started</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#f6faf9' },

  header: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: 32, paddingBottom: 20, gap: 8,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,106,97,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title:    { fontSize: 24, fontWeight: '800', color: '#181c1c', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: '#3e4947', textAlign: 'center', lineHeight: 20 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16, gap: 14 },

  point: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  pointIcon: {
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    backgroundColor: 'rgba(0,106,97,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  pointText:  { flex: 1, gap: 4 },
  pointTitle: { fontSize: 14, fontWeight: '700', color: '#181c1c' },
  pointBody:  { fontSize: 13, color: '#3e4947', lineHeight: 20 },

  divider: { height: 1, backgroundColor: '#dde4e2', marginVertical: 4 },
  closing: { fontSize: 12, color: '#6e7977', lineHeight: 19, textAlign: 'center', paddingHorizontal: 4 },

  footer: {
    paddingHorizontal: 20, paddingTop: 16, gap: 14,
    backgroundColor: 'rgba(246,250,249,0.97)',
    borderTopWidth: 1, borderTopColor: '#dde4e2',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#bdc9c6', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxOn:  { backgroundColor: '#006a61', borderColor: '#006a61' },
  checkLabel:  { flex: 1, fontSize: 14, color: '#181c1c', fontWeight: '500', lineHeight: 20 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#006a61', borderRadius: 9999,
    paddingVertical: 16,
    shadowColor: '#006a61', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { backgroundColor: '#bdc9c6', shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: -0.2 },
});
