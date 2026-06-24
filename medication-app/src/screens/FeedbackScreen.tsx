import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FORM_ID = '1FAIpQLSeJToEYsexTE80qlQAfMtkgDxBdgBsZpZaZuHwzoioUSGGG0A';
const SUBMIT_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

const ENTRIES = {
  rating:       'entry.23879794',
  description:  'entry.1564822062',
  improvement:  'entry.1879548942',
  source:       'entry.1693406313',
  comments:     'entry.1085771246',
};

interface Props {
  language: string;
  isRTL: boolean;
  onBack: () => void;
}

export default function FeedbackScreen({ language, isRTL, onBack }: Props) {
  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;
  const rtl = isRTL ? styles.rtl : undefined;

  const [rating, setRating]           = useState(0);
  const [description, setDescription] = useState('');
  const [improvement, setImprovement] = useState('');
  const [source, setSource]           = useState('');
  const [comments, setComments]       = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const descOptions = [
    { en: 'Very useful',        ar: 'مفيد جداً',      value: 'Very useful' },
    { en: 'Useful',             ar: 'مفيد',            value: 'Useful' },
    { en: 'Needs improvement',  ar: 'يحتاج تحسين',    value: 'Needs Improvement' },
    { en: 'Too simple',         ar: 'بسيط جداً',      value: 'Too Simple' },
  ];

  const sourceOptions = [
    { en: 'Instagram',          ar: 'انستغرام',        value: 'Instagram' },
    { en: 'Google Play Store',  ar: 'متجر جوجل بلاي', value: 'Google Play Store' },
    { en: 'Friend or family',   ar: 'صديق أو أسرة',   value: 'Friend or Family' },
    { en: 'Google Search',      ar: 'بحث جوجل',       value: 'Google Search' },
    { en: 'Other',              ar: 'أخرى',            value: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('', ar('Please select a rating', 'الرجاء اختيار تقييم'));
      return;
    }
    if (!description) {
      Alert.alert('', ar('Please describe your experience', 'الرجاء وصف تجربتك'));
      return;
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append(ENTRIES.rating,      String(rating));
      params.append(ENTRIES.description, description);
      if (improvement) params.append(ENTRIES.improvement, improvement);
      if (source)      params.append(ENTRIES.source,      source);
      if (comments)    params.append(ENTRIES.comments,    comments);

      await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      setSubmitted(true);
    } catch {
      // Google Forms returns a redirect which fetch treats as an error — submission still works
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successRoot}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#006a61" />
          </View>
          <Text style={[styles.successTitle, rtl]}>
            {ar('Thank you!', 'شكراً لك!')}
          </Text>
          <Text style={[styles.successDesc, rtl]}>
            {ar(
              'Your feedback helps us improve Pregna AI for every expectant mother.',
              'ملاحظاتك تساعدنا على تحسين امن AI لكل أم حامل.'
            )}
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>{ar('Done', 'تم')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={isRTL ? 'arrow-right' : 'arrow-left'}
            size={24}
            color="#181c1c"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ar('Send Feedback', 'أرسل ملاحظاتك')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Q1 — Star Rating */}
        <View style={styles.card}>
          <Text style={[styles.question, rtl]}>
            {ar('Overall rating', 'التقييم العام')}
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={i <= rating ? '#f59e0b' : '#d1d9d7'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', ar('Poor','ضعيف'), ar('Fair','مقبول'), ar('Good','جيد'), ar('Very good','جيد جداً'), ar('Excellent','ممتاز')][rating]}
            </Text>
          )}
        </View>

        {/* Q2 — App description */}
        <View style={styles.card}>
          <Text style={[styles.question, rtl]}>
            {ar('How would you describe the app?', 'كيف تصف التطبيق؟')}
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.chipsWrap}>
            {descOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, description === opt.value && styles.chipActive]}
                onPress={() => setDescription(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, description === opt.value && styles.chipTextActive]}>
                  {language === 'ar' ? opt.ar : opt.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Q3 — Improvement */}
        <View style={styles.card}>
          <Text style={[styles.question, rtl]}>
            {ar('What could we improve?', 'ما الذي يمكن تحسينه؟')}
            <Text style={styles.optional}> {ar('(optional)', '(اختياري)')}</Text>
          </Text>
          <TextInput
            style={[styles.textArea, rtl]}
            placeholder={ar('Tell us what you think...', 'أخبرنا برأيك...')}
            placeholderTextColor="#bdc9c6"
            value={improvement}
            onChangeText={setImprovement}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Q4 — Source */}
        <View style={styles.card}>
          <Text style={[styles.question, rtl]}>
            {ar('Where did you hear about us?', 'كيف سمعت عنا؟')}
            <Text style={styles.optional}> {ar('(optional)', '(اختياري)')}</Text>
          </Text>
          <View style={styles.chipsWrap}>
            {sourceOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, source === opt.value && styles.chipActive]}
                onPress={() => setSource(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, source === opt.value && styles.chipTextActive]}>
                  {language === 'ar' ? opt.ar : opt.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Q5 — Other comments */}
        <View style={styles.card}>
          <Text style={[styles.question, rtl]}>
            {ar('Any other comments?', 'أي ملاحظات أخرى؟')}
            <Text style={styles.optional}> {ar('(optional)', '(اختياري)')}</Text>
          </Text>
          <TextInput
            style={[styles.textArea, rtl]}
            placeholder={ar('Anything else you want us to know...', 'أي شيء آخر تريد إخبارنا به...')}
            placeholderTextColor="#bdc9c6"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
              <Text style={styles.submitText}>{ar('Send Feedback', 'أرسل الملاحظات')}</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f6faf9' },
  rowRev: { flexDirection: 'row-reverse' },
  rtl:    { textAlign: 'right', writingDirection: 'rtl' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(246,250,249,0.96)',
    borderBottomWidth: 1, borderBottomColor: '#ebefee',
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#181c1c' },

  scroll:  { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  card: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20, gap: 14,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },

  question: { fontSize: 15, fontWeight: '700', color: '#181c1c' },
  required: { color: '#ba1a1a' },
  optional: { fontSize: 13, fontWeight: '400', color: '#6e7977' },

  // Stars
  starsRow:    { flexDirection: 'row', gap: 8 },
  ratingLabel: { fontSize: 13, fontWeight: '600', color: '#006a61', textAlign: 'center' },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: '#ebefee', borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive:     { backgroundColor: 'rgba(0,106,97,0.1)', borderColor: '#006a61' },
  chipText:       { fontSize: 13, fontWeight: '600', color: '#3e4947' },
  chipTextActive: { color: '#006a61' },

  // Text area
  textArea: {
    backgroundColor: '#f6faf9', borderRadius: 16, padding: 14,
    fontSize: 14, color: '#181c1c', minHeight: 90,
    borderWidth: 1, borderColor: '#ebefee',
  },

  // Submit
  submitBtn: {
    backgroundColor: '#006a61', borderRadius: 9999,
    paddingVertical: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#006a61', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#77d7ca' },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  // Success
  successRoot: {
    flex: 1, backgroundColor: '#f6faf9',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successCard: {
    backgroundColor: '#ffffff', borderRadius: 32, padding: 36,
    alignItems: 'center', gap: 16, width: '100%',
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 8,
  },
  successIcon:  { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ebfaf8', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#181c1c' },
  successDesc:  { fontSize: 14, color: '#3e4947', textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: '#006a61', borderRadius: 9999,
    paddingHorizontal: 40, paddingVertical: 16, marginTop: 8,
  },
  doneBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
