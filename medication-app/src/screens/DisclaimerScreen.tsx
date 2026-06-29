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

const CONTENT = {
  en: {
    title: 'Before You Begin',
    subtitle: 'Please read this important information carefully.',
    points: [
      {
        icon: 'robot-outline' as const,
        title: 'AI-Powered Tool',
        body: 'Pregna AI uses artificial intelligence to identify medications and retrieve safety ratings. AI systems can make mistakes — always verify the information provided.',
      },
      {
        icon: 'stethoscope' as const,
        title: 'Not Medical Advice',
        body: 'This app is for informational purposes only. It does not replace consultation with a doctor, pharmacist, or any qualified healthcare professional.',
      },
      {
        icon: 'account-heart-outline' as const,
        title: 'Consult Before You Act',
        body: 'Always speak with your doctor or pharmacist before taking, changing, or stopping any medication during pregnancy.',
      },
      {
        icon: 'flag-outline' as const,
        title: 'Australian Classification System',
        body: 'Safety ratings follow the Australian Drug Evaluation Committee (ADEC) system — a globally recognised framework for prescribing medicines in pregnancy.',
      },
      {
        icon: 'tune-variant' as const,
        title: 'Results May Vary',
        body: 'Medication safety depends on your trimester, dosage, and medical history. This app provides general guidance only.',
      },
    ],
    closing: 'By proceeding, you confirm that Pregna AI is a reference tool only and that all medical decisions must be made with a qualified healthcare provider.',
    checkLabel: 'I have read and accept this disclaimer',
    btn: 'Get Started',
    langBtn: 'عربي',
  },
  ar: {
    title: 'قبل البدء',
    subtitle: 'يرجى قراءة هذه المعلومات المهمة بعناية.',
    points: [
      {
        icon: 'robot-outline' as const,
        title: 'تطبيق مدعوم بالذكاء الاصطناعي',
        body: 'يستخدم Pregna AI الذكاء الاصطناعي للتعرف على الأدوية واسترجاع تصنيفات السلامة. قد يُخطئ الذكاء الاصطناعي أحياناً، لذا تحققي دائماً من المعلومات.',
      },
      {
        icon: 'stethoscope' as const,
        title: 'ليس استشارة طبية',
        body: 'هذا التطبيق للأغراض التثقيفية فقط، ولا يُغني عن استشارة الطبيب أو الصيدلاني أو أي مختص في الرعاية الصحية.',
      },
      {
        icon: 'account-heart-outline' as const,
        title: 'استشيري قبل أي قرار',
        body: 'تحدثي دائماً مع طبيبكِ أو صيدلانيكِ قبل تناول أي دواء أو تغييره أو إيقافه خلال فترة الحمل.',
      },
      {
        icon: 'flag-outline' as const,
        title: 'نظام التصنيف الأسترالي',
        body: 'تستند تصنيفات السلامة إلى نظام لجنة تقييم الأدوية الأسترالية (ADEC) — إطار معتمد دولياً لوصف الأدوية خلال الحمل.',
      },
      {
        icon: 'tune-variant' as const,
        title: 'النتائج تختلف من شخص لآخر',
        body: 'تعتمد سلامة الدواء على مرحلة الحمل والجرعة والتاريخ الطبي. يُقدّم هذا التطبيق إرشادات عامة فقط.',
      },
    ],
    closing: 'بالمتابعة، تُقرّين بأن Pregna AI أداة مرجعية فقط، وأن جميع القرارات الطبية يجب اتخاذها بالتشاور مع مختص في الرعاية الصحية.',
    checkLabel: 'لقد قرأتُ هذا الإخلاء وأوافق عليه',
    btn: 'ابدئي الآن',
    langBtn: 'English',
  },
};

export default function DisclaimerScreen({ onAccept }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const insets = useSafeAreaInsets();

  const c = CONTENT[lang];
  const isRTL = lang === 'ar';
  const rtl = isRTL ? styles.rtl : undefined;
  const rowRev = isRTL ? styles.rowRev : undefined;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Language toggle */}
      <TouchableOpacity
        style={[styles.langBtn, isRTL ? styles.langBtnLeft : styles.langBtnRight]}
        onPress={() => setLang(l => l === 'en' ? 'ar' : 'en')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="translate" size={15} color="#006a61" />
        <Text style={styles.langBtnText}>{c.langBtn}</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-alert-outline" size={32} color="#006a61" />
        </View>
        <Text style={[styles.title, rtl]}>{c.title}</Text>
        <Text style={[styles.subtitle, rtl]}>{c.subtitle}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {c.points.map(({ icon, title, body }) => (
          <View key={title} style={[styles.point, rowRev]}>
            <View style={styles.pointIcon}>
              <MaterialCommunityIcons name={icon} size={20} color="#006a61" />
            </View>
            <View style={styles.pointText}>
              <Text style={[styles.pointTitle, rtl]}>{title}</Text>
              <Text style={[styles.pointBody, rtl]}>{body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={[styles.closing, rtl]}>{c.closing}</Text>
      </ScrollView>

      {/* Accept row + button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 24) }]}>
        <TouchableOpacity
          style={[styles.checkRow, rowRev]}
          onPress={() => setAccepted(v => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted && (
              <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
            )}
          </View>
          <Text style={[styles.checkLabel, rtl]}>{c.checkLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, !accepted && styles.btnDisabled]}
          onPress={accepted ? onAccept : undefined}
          activeOpacity={accepted ? 0.85 : 1}
        >
          <Text style={styles.btnText}>{c.btn}</Text>
          <MaterialCommunityIcons
            name={isRTL ? 'arrow-left' : 'arrow-right'}
            size={18}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#f6faf9' },
  rtl:   { textAlign: 'right', writingDirection: 'rtl' },
  rowRev:{ flexDirection: 'row-reverse' },

  langBtn: {
    position: 'absolute', top: 52, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ebefee', borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  langBtnRight: { right: 20 },
  langBtnLeft:  { left: 20 },
  langBtnText:  { fontSize: 12, fontWeight: '700', color: '#006a61' },

  header: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: 36, paddingBottom: 20, gap: 8,
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },

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
  pointText:  { flex: 1, gap: 3 },
  pointTitle: { fontSize: 14, fontWeight: '700', color: '#181c1c' },
  pointBody:  { fontSize: 13, color: '#3e4947', lineHeight: 19 },

  divider: { height: 1, backgroundColor: '#dde4e2', marginVertical: 4 },
  closing: { fontSize: 12, color: '#6e7977', lineHeight: 19, textAlign: 'center', paddingHorizontal: 4 },

  footer: {
    paddingHorizontal: 20, paddingTop: 16, gap: 14,
    backgroundColor: 'rgba(246,250,249,0.97)',
    borderTopWidth: 1, borderTopColor: '#dde4e2',
  },
  checkRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
