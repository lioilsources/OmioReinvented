import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';

interface ChildRowProps {
  index: number;
  age: number;
  onAgeChange: (age: number) => void;
  onRemove: () => void;
}

const AGE_OPTIONS = Array.from({ length: 18 }, (_, i) => i);

export function ChildRow({ index, age, onAgeChange, onRemove }: ChildRowProps) {
  const priceLabel =
    age < 6 ? 'Free' : age < 15 ? 'Half price' : 'Full price';
  const priceColor = age < 6 ? colors.success : age < 15 ? colors.primary : colors.text;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>Child {index + 1}</Text>
        <Text style={[styles.priceHint, { color: priceColor }]}>
          {priceLabel}
        </Text>
      </View>
      <View style={styles.controls}>
        <View style={styles.agePicker}>
          {[0, 3, 6, 10, 14, 17].map((a) => (
            <Pressable
              key={a}
              style={[styles.ageBtn, age === a && styles.ageBtnActive]}
              onPress={() => onAgeChange(a)}
            >
              <Text
                style={[styles.ageText, age === a && styles.ageTextActive]}
              >
                {a}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  priceHint: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  agePicker: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.xs,
  },
  ageBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  ageBtnActive: {
    backgroundColor: colors.primary,
  },
  ageText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ageTextActive: {
    color: colors.chipTextActive,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
