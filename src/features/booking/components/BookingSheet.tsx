import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '@/shared/constants/theme';
import type { BookingPhase } from '../hooks/useBookingFlow';
import { NavigationMap } from './NavigationMap';

const STEPS: { phase: BookingPhase; label: string }[] = [
  { phase: 'fetching_offers', label: 'Offer' },
  { phase: 'creating_booking', label: 'Create' },
  { phase: 'polling_initialised', label: 'Setup' },
  { phase: 'updating_travellers', label: 'Details' },
  { phase: 'polling_reserved', label: 'Reserve' },
  { phase: 'confirming', label: 'Confirm' },
  { phase: 'polling_booked', label: 'Finalize' },
];

function getPhaseIndex(phase: BookingPhase): number {
  const idx = STEPS.findIndex((s) => s.phase === phase);
  return idx >= 0 ? idx : -1;
}

const DOT_SIZE = 24;
const STEP_WIDTH = 100;
const LINE_WIDTH = 20;

function BookingStepper({ phase }: { phase: BookingPhase }) {
  const scrollRef = useRef<ScrollView>(null);
  const currentIdx = getPhaseIndex(phase);

  useEffect(() => {
    // Scroll so current step is visible (centered-ish)
    const offset = Math.max(0, currentIdx * (STEP_WIDTH + LINE_WIDTH) - 80);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [currentIdx]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stepperStyles.content}
    >
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = !isDone && !isCurrent;

        return (
          <React.Fragment key={step.phase}>
            <View style={stepperStyles.step}>
              {isDone && (
                <View style={[stepperStyles.dot, stepperStyles.dotDone]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              {isCurrent && (
                <View style={[stepperStyles.dot, stepperStyles.dotCurrent]}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              {isFuture && (
                <View style={[stepperStyles.dot, stepperStyles.dotFuture]} />
              )}
              <Text
                style={[
                  stepperStyles.label,
                  isDone && stepperStyles.labelDone,
                  isCurrent && stepperStyles.labelCurrent,
                  isFuture && stepperStyles.labelFuture,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View
                style={[
                  stepperStyles.line,
                  isDone ? stepperStyles.lineDone : stepperStyles.lineFuture,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}

const stepperStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: STEP_WIDTH,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
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
  label: {
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  labelDone: {
    color: colors.success,
    fontWeight: '600',
  },
  labelCurrent: {
    color: colors.text,
    fontWeight: '700',
  },
  labelFuture: {
    color: colors.textLight,
  },
  line: {
    width: LINE_WIDTH,
    height: 2,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  lineFuture: {
    backgroundColor: colors.border,
  },
});

interface BookingSheetProps {
  phase: BookingPhase;
  bookingId: string | null;
  error: string | null;
  journeyProvider: string;
  stationName: string;
  stationLat?: number;
  stationLng?: number;
  onCancel: () => void;
  onRetry: () => void;
}

export function BookingSheet({
  phase,
  bookingId,
  error,
  journeyProvider,
  stationName,
  stationLat,
  stationLng,
  onCancel,
  onRetry,
}: BookingSheetProps) {
  if (phase === 'completed') {
    return (
      <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={52} color={colors.success} />
          <Text style={styles.successTitle}>Booked!</Text>
          <Text style={styles.successSub}>
            Your {journeyProvider} ticket is confirmed.
          </Text>
          {bookingId && (
            <Text style={styles.bookingId}>Booking: {bookingId}</Text>
          )}
        </View>
        <NavigationMap stationName={stationName} stationLat={stationLat} stationLng={stationLng} />
        <Pressable style={styles.backButton} onPress={onCancel}>
          <Text style={styles.backButtonText}>Back to results</Text>
        </Pressable>
      </BottomSheetScrollView>
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

  return (
    <View style={styles.bookingContainer}>
      <BookingStepper phase={phase} />
      <Text style={styles.title}>Booking {journeyProvider}</Text>
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
  bookingContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  scrollContainer: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
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
    width: '100%',
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
