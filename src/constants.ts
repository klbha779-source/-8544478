export interface Subject {
  id: string;
  name: string;
}

export type TargetLevel = 'high' | 'smart';

export const SUBJECTS: Subject[] = [
  { id: 'islamic', name: 'التربية الإسلامية' },
  { id: 'arabic', name: 'اللغة العربية' },
  { id: 'physics', name: 'الفيزياء' },
  { id: 'biology', name: 'الأحياء' },
];

export const SUBJECT_HOURS: Record<TargetLevel, Record<string, number>> = {
  high: {
    islamic: 40,
    arabic: 140,
    physics: 150,
    biology: 120,
  },
  smart: {
    islamic: 15,
    arabic: 45,
    physics: 50,
    biology: 40,
  }
};

export const TARGET_DATE = new Date('2026-06-13T06:00:00');
