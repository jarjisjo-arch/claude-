import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchRecord } from './HomeScreen';

interface Props {
  history: SearchRecord[];
  language: string;
  isRTL: boolean;
  t: any;
  onDelete: (id: string) => void;
}

function catColor(cat: string | null): string {
  if (!cat) return '#6e7977';
  const map: Record<string, string> = {
    A: '#006a61', B1: '#256862', B2: '#256862', B3: '#256862',
    C: '#825400', D: '#d35400', X: '#ba1a1a',
  };
  return map[cat] ?? '#6e7977';
}

function timeAgo(date: Date, language: string): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)  return language === 'ar' ? 'الآن'             : 'Just now';
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return language === 'ar' ? `منذ ${m} دقيقة` : `${m}m ago`;
  }
  const h = Math.floor(seconds / 3600);
  return language === 'ar' ? `منذ ${h} ساعة` : `${h}h ago`;
}

export default function HistoryScreen({ history, language, isRTL, t, onDelete }: Props) {
  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, isRTL && styles.rtl]}>
        {ar('Search History', 'سجل البحث')}
      </Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="history" size={64} color="#bdc9c6" />
          <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>
            {ar('No searches yet', 'لا يوجد سجل بحث بعد')}
          </Text>
          <Text style={[styles.emptyDesc, isRTL && styles.rtl]}>
            {ar(
              'Your medication searches will appear here.',
              'ستظهر هنا نتائج بحثك عن الأدوية.'
            )}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {history.map((record) => {
            const color = catColor(record.overallCategory);
            const medName = record.medication
              ? (language === 'ar' ? record.medication.nameAr : record.medication.nameEn)
              : record.ingredientResults.length > 0
                ? record.ingredientResults[0].names[0]
                : record.query;

            const isMulti = record.ingredientResults.length > 1;
            const notFound = !record.medication && record.ingredientResults.length === 0;

            return (
              <View key={record.id} style={[styles.item, isRTL && styles.rowRev]}>
                {/* Category badge */}
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>
                    {record.overallCategory ?? '?'}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, isRTL && styles.rtl]} numberOfLines={1}>
                    {notFound
                      ? (language === 'ar' ? 'غير موجود' : 'Not found')
                      : medName}
                  </Text>
                  <View style={[styles.itemMeta, isRTL && styles.rowRev]}>
                    <MaterialCommunityIcons
                      name={record.searchType === 'image' ? 'camera' : 'magnify'}
                      size={12}
                      color="#6e7977"
                    />
                    <Text style={styles.itemTime}>
                      {timeAgo(record.timestamp, language)}
                    </Text>
                    {isMulti && (
                      <View style={styles.multiChip}>
                        <Text style={styles.multiChipText}>
                          {record.ingredientResults.length} {ar('ingredients', 'مكونات')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => onDelete(record.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#bdc9c6" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {history.length > 0 && (
        <Text style={styles.historyNote}>
          {ar(`${history.length} saved searches · tap 🗑 to delete`, `${history.length} بحث محفوظ · اضغط 🗑 للحذف`)}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f6faf9' },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  rowRev:  { flexDirection: 'row-reverse' },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  heading: { fontSize: 26, fontWeight: '800', color: '#181c1c', letterSpacing: -0.4 },

  emptyState: { paddingVertical: 80, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#181c1c', textAlign: 'center' },
  emptyDesc:  { fontSize: 14, color: '#3e4947', textAlign: 'center', lineHeight: 22 },

  list: { gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#ffffff', borderRadius: 20, padding: 14,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  badge: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  badgeText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },

  itemInfo:  { flex: 1, gap: 4 },
  itemName:  { fontSize: 15, fontWeight: '700', color: '#181c1c' },
  itemMeta:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemTime:  { fontSize: 11, color: '#6e7977' },

  multiChip: {
    backgroundColor: '#ebefee', borderRadius: 9999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  multiChipText: { fontSize: 10, fontWeight: '600', color: '#3e4947' },

  historyNote: { fontSize: 11, color: '#6e7977', textAlign: 'center', fontStyle: 'italic' },
});
