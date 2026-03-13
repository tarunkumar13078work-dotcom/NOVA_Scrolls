export type ReadingStatus = 'reading' | 'completed' | 'on-hold' | 'dropped' | 'planning';

export type GenreTag =
  | 'Action'
  | 'Fantasy'
  | 'Murim'
  | 'Romance'
  | 'System'
  | 'Regression';

export interface Collection {
  id: string;
  name: string;
}

export interface ReadingStats {
  totalChaptersRead: number;
  readingStreakDays: number;
  completionRate: number;
}
