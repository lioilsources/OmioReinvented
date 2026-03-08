import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, Modal, FlatList } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';
import type { Origin } from '@/stores/useSearchStore';

interface OriginPillProps {
  name: string;
  origins: Origin[];
  onSelect: (origin: Origin) => void;
}

export function OriginPill({ name, origins, onSelect }: OriginPillProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.pill} onPress={() => setVisible(true)}>
        <Text style={styles.label}>From:</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
            <Text style={styles.dropdownTitle}>Select origin</Text>
            <FlatList
              data={origins}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.name === name && styles.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item.name === name && styles.optionTextActive]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    fontSize: 8,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    width: 260,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  optionActive: {
    backgroundColor: colors.surface,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
});
