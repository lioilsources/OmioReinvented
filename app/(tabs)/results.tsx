import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { JourneyList } from '@/features/results/components/JourneyList';
import { useJourneys } from '@/features/results/hooks/useJourneys';
import { useJourneySort } from '@/features/results/hooks/useJourneySort';
import { useSearchStore } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, fontSize, spacing } from '@/shared/constants/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const destination = useSearchStore((s) => s.destination);
  const timeMode = useSearchStore((s) => s.timeMode);
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);

  const { data: journeys, isLoading } = useJourneys();
  const { sorted, sortMode, setSortMode } = useJourneySort(journeys);

  const handleBack = () => {
    setActiveSheet('destinations');
    router.push('/(tabs)/map');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <Text style={styles.back}>← Explore</Text>
        </Pressable>
        {destination && (
          <View>
            <Text style={styles.title}>
              Prague → {destination.name}
            </Text>
            {timeMode && (
              <Text style={styles.subtitle}>
                {timeMode.replace('_', ' ')}
              </Text>
            )}
          </View>
        )}
      </View>
      <JourneyList
        journeys={sorted}
        sortMode={sortMode}
        onSortChange={setSortMode}
        loading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  back: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
