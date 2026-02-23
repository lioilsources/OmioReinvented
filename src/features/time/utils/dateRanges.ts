import type { TimeMode } from '@/shared/types';

interface TimeModeInfo {
  label: string;
  emoji: string;
}

export const timeModes: Record<TimeMode, TimeModeInfo> = {
  tomorrow: { label: 'Tomorrow', emoji: '📅' },
  next_week: { label: 'Next week', emoji: '🗓' },
  next_month: { label: 'Next month', emoji: '📆' },
  holidays: { label: 'Holidays', emoji: '🎉' },
  christmas: { label: 'Christmas', emoji: '🎄' },
  spring_break: { label: 'Spring break', emoji: '🌸' },
};

export const TIME_MODE_ORDER: TimeMode[] = [
  'tomorrow',
  'next_week',
  'next_month',
  'holidays',
  'christmas',
  'spring_break',
];
