import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/shared/constants/theme';
import type { BookingPhase } from '../hooks/useBookingFlow';

const STEPS: { phase: BookingPhase; label: string }[] = [
  { phase: 'fetching_offers', label: 'Finding best offer' },
  { phase: 'creating_booking', label: 'Creating booking' },
  { phase: 'polling_initialised', label: 'Setting up' },
  { phase: 'updating_travellers', label: 'Adding traveller details' },
  { phase: 'polling_reserved', label: 'Reserving seat' },
  { phase: 'confirming', label: 'Confirming' },
  { phase: 'polling_booked', label: 'Finalizing' },
];

function getPhaseIndex(phase: BookingPhase): number {
  const idx = STEPS.findIndex((s) => s.phase === phase);
  return idx >= 0 ? idx : -1;
}

interface BookingSheetProps {
  phase: BookingPhase;
  bookingId: string | null;
  error: string | null;
  journeyProvider: string;
  onCancel: () => void;
  onRetry: () => void;
}

export function BookingSheet({
  phase,
  bookingId,
  error,
  journeyProvider,
  onCancel,
  onRetry,
}: BookingSheetProps) {
  if (phase === 'completed') {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Booked!</Text>
          <Text style={styles.successSub}>
            Your {journeyProvider} ticket is confirmed.
          </Text>
          {bookingId && (
            <Text style={styles.bookingId}>Booking: {bookingId}</Text>
          )}
        </View>
        <Pressable style={styles.backButton} onPress={onCancel}>
          <Text style={styles.backButtonText}>Back to results</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Booking failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          {bookingId && (
            <Text style={styles.bookingId}>Booking: {bookingId}</Text>
          )}
        </View>
        <View style={styles.buttonRow}>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentIdx = getPhaseIndex(phase);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking {journeyProvider}</Text>

      <View style={styles.stepper}>
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;

          return (
            <View key={step.phase} style={styles.step}>
              <View style={styles.stepIndicator}>
                {isDone && (
                  <View style={[styles.dot, styles.dotDone]}>
                    <Text style={styles.dotCheck}>✓</Text>
                  </View>
                )}
                {isCurrent && (
                  <View style={[styles.dot, styles.dotCurrent]}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                {isFuture && <View style={[styles.dot, styles.dotFuture]} />}
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      isDone ? styles.lineDone : styles.lineFuture,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isDone && styles.stepLabelDone,
                  isCurrent && styles.stepLabelCurrent,
                  isFuture && styles.stepLabelFuture,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  stepper: {
    alignSelf: 'center',
    gap: 0,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  stepIndicator: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotCurrent: {
    backgroundColor: colors.primary,
  },
  dotFuture: {
    backgroundColor: colors.border,
  },
  dotCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  line: {
    width: 2,
    height: 16,
    alignSelf: 'center',
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  lineFuture: {
    backgroundColor: colors.border,
  },
  stepLabel: {
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  stepLabelDone: {
    color: colors.success,
  },
  stepLabelCurrent: {
    color: colors.text,
    fontWeight: '600',
  },
  stepLabelFuture: {
    color: colors.textLight,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  successSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  bookingId: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.error,
  },
  errorMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  retryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});
