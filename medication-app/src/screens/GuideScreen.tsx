import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  language: string;
  isRTL: boolean;
}

export default function GuideScreen({ language, isRTL }: Props) {
  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;
  const rtl = isRTL && styles.rtl;
  const rowDir = isRTL ? styles.rowRev : styles.row;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, rtl]}>
        {ar('App Guide', 'دليل التطبيق')}
      </Text>

      {/* ── How to Use ──────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, rtl]}>
          {ar('How to Use', 'كيفية الاستخدام')}
        </Text>

        {[
          {
            icon: 'magnify' as const,
            color: '#006a61',
            bg: 'rgba(0,106,97,0.1)',
            title: ar('Search by Name', 'البحث بالاسم'),
            desc: ar(
              'Type the medication name in the search bar on the home screen. Works with brand names and generic names.',
              'اكتبي اسم الدواء في شريط البحث في الشاشة الرئيسية. يعمل مع الأسماء التجارية والعلمية.'
            ),
          },
          {
            icon: 'camera' as const,
            color: '#006a61',
            bg: 'rgba(0,106,97,0.1)',
            title: ar('Take a Photo', 'التقاط صورة'),
            desc: ar(
              'Tap "Take Photo" or the SCAN button. Point your camera at the medication label — our AI will identify all active ingredients automatically.',
              'اضغطي على "التقاط صورة" أو زر المسح. وجّهي الكاميرا نحو ملصق الدواء وسيتعرف الذكاء الاصطناعي على المكونات تلقائياً.'
            ),
          },
          {
            icon: 'file-upload' as const,
            color: '#256862',
            bg: 'rgba(37,104,98,0.1)',
            title: ar('Upload from Gallery', 'رفع من المعرض'),
            desc: ar(
              'Tap "Upload Image" and choose a clear photo of the medication packaging from your photo gallery.',
              'اضغطي على "رفع صورة" واختاري صورة واضحة لعبوة الدواء من معرض الصور.'
            ),
          },
          {
            icon: 'history' as const,
            color: '#825400',
            bg: 'rgba(130,84,0,0.1)',
            title: ar('View History', 'عرض السجل'),
            desc: ar(
              'The History tab shows all your recent searches in this session, with the safety category and timestamp.',
              'يعرض تبويب السجل جميع عمليات البحث الأخيرة في هذه الجلسة مع تصنيف السلامة والوقت.'
            ),
          },
        ].map(({ icon, color, bg, title, desc }) => (
          <View key={title} style={[styles.stepCard, rowDir]}>
            <View style={[styles.stepIcon, { backgroundColor: bg }]}>
              <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, rtl]}>{title}</Text>
              <Text style={[styles.stepDesc, rtl]}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Safety Categories ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, rtl]}>
          {ar('Safety Categories', 'تصنيفات السلامة')}
        </Text>
        <Text style={[styles.sectionSubtitle, rtl]}>
          {ar(
            'Based on the Australian Drug Evaluation Committee (ADEC) classification system used worldwide.',
            'بناءً على نظام التصنيف الأسترالي المعتمد دولياً للأدوية خلال الحمل.'
          )}
        </Text>

        {[
          { cat: 'A',  color: '#006a61', label: ar('Safest — No proven risk', 'الأكثر أماناً'), desc: ar('Adequate and well-controlled studies have failed to demonstrate risk to the fetus.', 'الدراسات الموثوقة لم تُثبت أي خطر على الجنين.') },
          { cat: 'B1', color: '#256862', label: ar('Likely Safe — Limited human data', 'آمن غالباً'), desc: ar('No evidence of increased occurrence of fetal damage in limited human data.', 'لا دليل على ضرر جنيني في البيانات البشرية المحدودة.') },
          { cat: 'B2', color: '#256862', label: ar('Likely Safe — Animal data ok', 'آمن غالباً'), desc: ar('Animal studies show no evidence of harm; human data insufficient.', 'دراسات الحيوانات لا تُظهر ضرراً؛ البيانات البشرية غير كافية.') },
          { cat: 'B3', color: '#256862', label: ar('Use with Caution', 'استخدمي بحذر'), desc: ar('Animal studies show some concern; significance in humans unknown.', 'دراسات الحيوانات تُظهر بعض المخاوف؛ الأهمية في البشر غير معروفة.') },
          { cat: 'C',  color: '#825400', label: ar('Caution — May affect fetus', 'تحذير'), desc: ar('Has caused or may cause harmful pharmacological effects on fetus. No malformations.', 'قد يُسبب آثاراً دوائية ضارة على الجنين دون تشوهات.') },
          { cat: 'D',  color: '#d35400', label: ar('High Risk — Fetal damage', 'خطر عالٍ'), desc: ar('Evidence of fetal malformation or irreversible damage. Emergency use only.', 'دليل على تشوهات جنينية. يُستخدم فقط في الطوارئ.') },
          { cat: 'X',  color: '#ba1a1a', label: ar('Prohibited', 'محظور مطلقاً'), desc: ar('High risk of permanent damage. Do not use in pregnancy under any circumstances.', 'خطر عالٍ من الضرر الدائم. لا تستخدمي تحت أي ظرف.') },
        ].map(({ cat, color, label, desc }) => (
          <View key={cat} style={[styles.catRow, rowDir]}>
            <View style={[styles.catBadge, { backgroundColor: color }]}>
              <Text style={styles.catBadgeText}>{cat}</Text>
            </View>
            <View style={styles.catInfo}>
              <Text style={[styles.catLabel, { color }, rtl]}>{label}</Text>
              <Text style={[styles.catDesc, rtl]}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Tips ─────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, rtl]}>
          {ar('Tips for Best Results', 'نصائح للحصول على أفضل النتائج')}
        </Text>
        {[
          ar('Hold the camera steady and ensure the label is well-lit.', 'أمسكي الكاميرا بثبات وتأكدي من إضاءة الملصق جيداً.'),
          ar('Use the generic (scientific) name for text search when possible.', 'استخدمي الاسم العلمي في البحث النصي إن أمكن.'),
          ar('For combination medications, the AI will detect all ingredients.', 'للأدوية المركبة، سيتعرف الذكاء الاصطناعي على جميع المكونات.'),
          ar('If scanning fails, try searching by name manually.', 'إذا فشل المسح، جربي البحث اليدوي بالاسم.'),
        ].map((tip, i) => (
          <View key={i} style={[styles.tipRow, rowDir]}>
            <View style={styles.tipDot} />
            <Text style={[styles.tipText, rtl]}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* ── Medical Disclaimer ───────────────────────────────────────────── */}
      <View style={styles.disclaimerCard}>
        <View style={[styles.disclaimerHeader, rowDir]}>
          <MaterialCommunityIcons name="alert-circle" size={22} color="#ba1a1a" />
          <Text style={styles.disclaimerTitle}>
            {ar('Medical Disclaimer', 'إخلاء المسؤولية الطبية')}
          </Text>
        </View>
        <Text style={[styles.disclaimerText, rtl]}>
          {ar(
            'Pregna AI provides medication safety information for informational purposes only. This app is NOT a substitute for professional medical advice, diagnosis, or treatment.\n\nAlways consult your doctor, pharmacist, or qualified healthcare provider before taking any medication during pregnancy. Never disregard professional medical advice or delay seeking it because of something you have read in this app.\n\nMedication safety can vary based on trimester, dosage, and individual medical history. Individual circumstances may differ.',
            'يُقدّم تطبيق Pregna AI معلومات سلامة الأدوية لأغراض تثقيفية فقط. هذا التطبيق ليس بديلاً عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج.\n\nاستشيري دائماً طبيبكِ أو الصيدلاني أو مقدم الرعاية الصحية المؤهل قبل تناول أي دواء خلال فترة الحمل. لا تتجاهلي المشورة الطبية المتخصصة أو تؤجّلي الحصول عليها بسبب معلومات وجدتِها في هذا التطبيق.\n\nقد تختلف سلامة الأدوية بحسب مرحلة الحمل والجرعة والتاريخ الطبي الفردي.'
          )}
        </Text>
      </View>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <View style={styles.aboutCard}>
        <MaterialCommunityIcons name="spa" size={28} color="#006a61" />
        <Text style={styles.aboutTitle}>Pregna AI</Text>
        <Text style={[styles.aboutDesc, rtl]}>
          {ar(
            'Helping expectant mothers make informed decisions about medication safety during pregnancy.',
            'نساعد الأمهات الحوامل على اتخاذ قرارات مستنيرة بشأن سلامة الأدوية خلال فترة الحمل.'
          )}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f6faf9' },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 20 },
  row:     { flexDirection: 'row' },
  rowRev:  { flexDirection: 'row-reverse' },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  heading: { fontSize: 26, fontWeight: '800', color: '#181c1c', letterSpacing: -0.4 },

  section:        { gap: 12 },
  sectionTitle:   { fontSize: 18, fontWeight: '800', color: '#181c1c', letterSpacing: -0.2 },
  sectionSubtitle:{ fontSize: 13, color: '#3e4947', lineHeight: 20 },

  // Steps
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  stepIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepText:  { flex: 1, gap: 4 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#181c1c' },
  stepDesc:  { fontSize: 13, color: '#3e4947', lineHeight: 20 },

  // Category rows
  catRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  catBadge:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catBadgeText:{ color: '#ffffff', fontSize: 14, fontWeight: '900' },
  catInfo:     { flex: 1, gap: 3 },
  catLabel:    { fontSize: 13, fontWeight: '700' },
  catDesc:     { fontSize: 12, color: '#3e4947', lineHeight: 18 },

  // Tips
  tipRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#006a61', marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, color: '#3e4947', lineHeight: 20 },

  // Disclaimer
  disclaimerCard: {
    backgroundColor: '#fff5f5', borderRadius: 24, padding: 20, gap: 12,
    borderWidth: 1, borderColor: 'rgba(186,26,26,0.1)',
  },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimerTitle:  { fontSize: 16, fontWeight: '800', color: '#ba1a1a' },
  disclaimerText:   { fontSize: 13, color: '#3e4947', lineHeight: 22 },

  // About
  aboutCard: {
    backgroundColor: '#006a61', borderRadius: 24, padding: 24,
    alignItems: 'center', gap: 10,
  },
  aboutTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  aboutDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
});
